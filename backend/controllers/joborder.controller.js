import mongoose from "mongoose";
import JobOrder from "../models/joborder.mode.js";
import ProjectIDCounter from "../models/projectIDCounter.model.js";
import multer from 'multer';
import {sendEmail, upload_JobQuotation_File_Single } from '../utils/helpers.js';
import { v2 as cloudinary } from 'cloudinary';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export const File_Storage = multer.memoryStorage();

// @desc Add new job order
// @route POST /api/joborder
export const addJobOrder = async (req, res) => {
    const job = req.body;
    
    try {
        let counter = await ProjectIDCounter.findOne();
  
        if (!counter) {
            counter = new ProjectIDCounter({ lastProjectID: 0 });
            await counter.save();
        }
  
        const newProjectID = `P${String(counter.lastProjectID + 1).padStart(7, '0')}`;
  
        await ProjectIDCounter.updateOne({}, { $inc: { lastProjectID: 1 } });
  
        job.projectID = newProjectID;

        let fileData;
        if (req.file) {
            const buffer = req.file.buffer;
            fileData = await upload_JobQuotation_File_Single(buffer);
            job.jobQuotation = fileData.url;
            job.jobQuotationPublicKey = fileData.public_id;
        }

        if (job.createdBy && job.createdBy === "Client" && job.inquiryStatus === "received") {
            job.createdBy = null;
            const mailSent = await sendEmail(
                job.clientEmail,
                "Mr. Quick Fix Inquiry",
                `<!DOCTYPE html>
                <html lang="en" >
                <head>
                    <meta charset="UTF-8">
                    <title>Mr. Quick Fix PH Project</title>


                </head>
                <body>
                <!-- partial:index.partial.html -->
                <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
                    <div style="margin:50px auto;width:70%;padding:20px 0">
                    <div style="border-bottom:1px solid #eee">
                        <a href="" style="font-size:1.4em;color:#FB4700;text-decoration:none;font-weight:600">Mr Quick Fix  </a>
                    </div>
                    <p style="font-size:1.1em">Hi Mr./Ms. ${job.clientLastName},</p>
                   <p>This email is to confirm that we have received your inquiry submitted through our website,<a href=${process.env.FRONTEND_WEBSITE}> Mr. Quick Fix </a>. Please be advised that we will use the phone number you provided to contact you for further details and information regarding your inquiry.
                   </p>
                   <p>
                   Thank you for trusting Mr. Quick Fix! </p>
                    <p style="font-size:0.9em;">Warm Regards,<br />Mr. Quick Fix</p>
                    <hr style="border:none;border-top:1px solid #eee" />
                    <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
                        <p>Mr Quick Fix PH</p>
                        <p>Philippines</p>
                    </div>
                    </div>
                </div>
                <!-- partial -->

                </body>
                </html>`
            )
    
        } else if (job.createdBy && !mongoose.Types.ObjectId.isValid(job.createdBy)) {
            return res.status(400).json({ success: false, message: "Invalid createdBy ID" });
        }

        const newJob = new JobOrder(job);
        const projectID = job.projectID;
        const datestart = job.jobStartDate ? new Date(job.jobStartDate).toDateString() : 'Not specified';
        const dateEnd = job.jobEndDate ? new Date(job.jobEndDate).toDateString() : 'Not specified';

        const emailHtml = datestart === 'Not specified' || dateEnd === 'Not specified' 
            ? `<!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Mr. Quick Fix - New Inquiry</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 auto;">
                        <tr>
                            <td align="center" style="padding: 40px 0;">
                                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                                    <!-- Header -->
                                    <tr>
                                        <td style="padding: 40px 30px; text-align: center; background-color: #FB4700; border-radius: 8px 8px 0 0;">
                                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Mr. Quick Fix</h1>
                                            <p style="margin: 10px 0 0; color: #ffffff; font-size: 16px;">New Inquiry Received</p>
                                        </td>
                                    </tr>

                                    <!-- Main Content -->
                                    <tr>
                                        <td style="padding: 40px 30px;">
                                            <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px;">Thank You for Your Inquiry</h2>
                                            <p style="margin: 0 0 15px; color: #666666; font-size: 16px; line-height: 1.5;">Dear Mr./Ms. ${job.clientLastName},</p>
                                            <p style="margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.5;">Thank you for submitting your inquiry through our website. Our team is currently reviewing your request and will contact you shortly.</p>
                                            
                                            <div style="background-color: #f8f9fa; border-left: 4px solid #FB4700; padding: 20px; margin: 20px 0; border-radius: 4px;">
                                                <p style="margin: 0; color: #666666; font-size: 16px; line-height: 1.5;">We will reach out to you using your provided contact information to discuss your requirements in detail.</p>
                                            </div>

                                            <p style="margin: 0 0 25px; color: #666666; font-size: 16px; line-height: 1.5;">If you have any urgent questions, feel free to contact us:</p>
                                            <div style="text-align: center; margin-bottom: 30px;">
                                                <a href="tel:0998 844 3285" style="display: inline-block; padding: 12px 25px; background-color: #FB4700; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold; margin: 0 10px;">Call Us</a>
                                                <a href="https://m.me/MLIMrQuickFix/" style="display: inline-block; padding: 12px 25px; background-color: #0084FF; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold; margin: 0 10px;">Message on Facebook</a>
                                            </div>
                                        </td>
                                    </tr>

                                    <!-- Footer -->
                                    <tr>
                                        <td style="padding: 30px; background-color: #f8f9fa; border-radius: 0 0 8px 8px;">
                                            <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 auto;">
                                                <tr>
                                                    <td style="text-align: center; padding-bottom: 20px;">
                                                        <p style="margin: 0; color: #666666; font-size: 16px; font-weight: bold;">Mr. Quick Fix</p>
                                                        <p style="margin: 5px 0 0; color: #666666; font-size: 14px;">Mr. Quick Fix is powered by Miescor Logistics, Inc. specializing in home repair and improvements.</p>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="text-align: center; padding-top: 20px;">
                                                        <p style="margin: 0; color: #999999; font-size: 12px;">© ${new Date().getFullYear()} Mr. Quick Fix. All rights reserved.</p>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>`
            : `<!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Mr. Quick Fix - Project Update</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 auto;">
                        <tr>
                            <td align="center" style="padding: 40px 0;">
                                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                                    <!-- Header -->
                                    <tr>
                                        <td style="padding: 40px 30px; text-align: center; background-color: #FB4700; border-radius: 8px 8px 0 0;">
                                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Mr. Quick Fix</h1>
                                            <p style="margin: 10px 0 0; color: #ffffff; font-size: 16px;">Project Schedule Update</p>
                                        </td>
                                    </tr>

                                    <!-- Main Content -->
                                    <tr>
                                        <td style="padding: 40px 30px;">
                                            <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px;">Project Details</h2>
                                            <p style="margin: 0 0 15px; color: #666666; font-size: 16px; line-height: 1.5;">Dear Mr./Ms. ${job.clientLastName},</p>
                                            
                                            <div style="background-color: #f8f9fa; border-left: 4px solid #FB4700; padding: 20px; margin: 20px 0; border-radius: 4px;">
                                                <p style="margin: 0; color: #333333; font-size: 18px; font-weight: bold;">Project Schedule</p>
                                                <p style="margin: 10px 0 0; color: #666666; font-size: 16px;">Project ID: <b>${projectID}</b></p>
                                                <p style="margin: 10px 0 0; color: #666666; font-size: 16px;">Start Date: <b>${datestart}</b></p>
                                                <p style="margin: 5px 0 0; color: #666666; font-size: 16px;">Expected Completion: <b>${dateEnd}</b></p>
                                            </div>

                                            ${fileData ? '<p style="margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.5;">Please find the attached quotation for your reference.</p>' : ''}
                                            
                                            <p style="margin: 0 0 25px; color: #666666; font-size: 16px; line-height: 1.5;">If you need to discuss any aspects of the project, please contact us:</p>
                                            <div style="text-align: center; margin-bottom: 30px;">
                                                <a href="tel:0998 844 3285" style="display: inline-block; padding: 12px 25px; background-color: #FB4700; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold; margin: 0 10px;">Call Us</a>
                                                <a href="https://m.me/MLIMrQuickFix/" style="display: inline-block; padding: 12px 25px; background-color: #0084FF; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold; margin: 0 10px;">Message on Facebook</a>
                                            </div>
                                        </td>
                                    </tr>

                                    <!-- Footer -->
                                    <tr>
                                        <td style="padding: 30px; background-color: #f8f9fa; border-radius: 0 0 8px 8px;">
                                            <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 auto;">
                                                <tr>
                                                    <td style="text-align: center; padding-bottom: 20px;">
                                                        <p style="margin: 0; color: #666666; font-size: 16px; font-weight: bold;">Mr. Quick Fix</p>
                                                        <p style="margin: 5px 0 0; color: #666666; font-size: 14px;">Mr. Quick Fix is powered by Miescor Logistics, Inc. specializing in home repair and improvements.</p>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="text-align: center; padding-top: 20px;">
                                                        <p style="margin: 0; color: #999999; font-size: 12px;">© ${new Date().getFullYear()} Mr. Quick Fix. All rights reserved.</p>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>`;

        const emailOptions = {
            to: job.clientEmail,
            subject: "Mr. Quick Fix Project",
            html: emailHtml
        };

        // Only add attachment if we have file data
        if (fileData) {
            emailOptions.attachments = [{
                filename: `Quotation.pdf`,
                path: fileData.url
            }];
        }

        const mailSent = await sendEmail(
            emailOptions.to,
            emailOptions.subject,
            emailOptions.html,
            emailOptions.attachments
        );

        await newJob.save();
        console.log(newJob);
        res.status(201).json({ success: true, data: newJob });
    } catch (error) {
        console.error("Error saving job order:", error.message);
        res.status(500).json({ success: false, message: "Server Error: Failed to save job order" });
    }
};

// @desc Update job order
// @route PUT /joborders
export const addJobOrderNoFileUpload = async (req, res) => {
    const job = req.body;
   
    try {
        let counter = await ProjectIDCounter.findOne();
  
        if (!counter) {
            counter = new ProjectIDCounter({ lastProjectID: 0 });
            await counter.save();
        }
  
        const newProjectID = `P${String(counter.lastProjectID + 1).padStart(7, '0')}`;
  
        await ProjectIDCounter.updateOne({}, { $inc: { lastProjectID: 1 } });
  
        job.projectID = newProjectID;

        if (job.createdBy && job.createdBy === "Client") {
            job.createdBy = null;
            
        } else if (job.createdBy && !mongoose.Types.ObjectId.isValid(job.createdBy)) {
            return res.status(400).json({ success: false, message: "Invalid createdBy ID" });
        }
        const inspectionDate = new Date(job.jobInspectionDate).toDateString();
        const projectID = job.projectID;
        const newJob = new JobOrder(job);
        await newJob.save();
        if(job.createdBy && job.createdBy !== "Client"){
        const mailSent = await sendEmail(
            job.clientEmail,
            "Mr. Quick Fix - Inspection Schedule",
            `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Mr. Quick Fix - Inspection Schedule</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
                <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 auto;">
                    <tr>
                        <td align="center" style="padding: 40px 0;">
                            <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                                <!-- Header -->
                                <tr>
                                    <td style="padding: 40px 30px; text-align: center; background-color: #FB4700; border-radius: 8px 8px 0 0;">
                                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Mr. Quick Fix</h1>
                                        <p style="margin: 10px 0 0; color: #ffffff; font-size: 16px;">Inspection Schedule Confirmation</p>
                                    </td>
                                </tr>

                                <!-- Main Content -->
                                <tr>
                                    <td style="padding: 40px 30px;">
                                        <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px;">Inspection Details</h2>
                                        <p style="margin: 0 0 15px; color: #666666; font-size: 16px; line-height: 1.5;">Dear Mr./Ms. ${job.clientLastName},</p>
                                        
                                        <div style="background-color: #f8f9fa; border-left: 4px solid #FB4700; padding: 20px; margin: 20px 0; border-radius: 4px;">
                                            <p style="margin: 0; color: #333333; font-size: 18px; font-weight: bold;">Scheduled Date</p>                          
                                            <p style="margin: 10px 0 0; color: #666666; font-size: 16px;">${inspectionDate}</p>
                                            <p style="margin: 10px 0 0; color: #666666; font-size: 16px;">Project ID: <b>${projectID}</b></p>
                                        </div>

                                        <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                                            <tr>
                                                <td style="padding: 20px; background-color: #f8f9fa; border-radius: 4px;">
                                                    <p style="margin: 0; color: #FB4700; font-size: 18px; font-weight: bold;">What to Expect</p>
                                                    <ul style="margin: 10px 0 0; color: #666666; font-size: 16px; padding-left: 20px;">
                                                        <li style="margin: 5px 0;">Thorough assessment of the work area</li>
                                                        <li style="margin: 5px 0;">Discussion of your requirements</li>
                                                        <li style="margin: 5px 0;">Initial cost estimation</li>
                                                        <li style="margin: 5px 0;">Project timeline planning</li>
                                                    </ul>
                                                </td>
                                            </tr>
                                        </table>

                                        <p style="margin: 0 0 25px; color: #666666; font-size: 16px; line-height: 1.5;">Need to reschedule or have questions? Contact us:</p>
                                        <div style="text-align: center; margin-bottom: 30px;">
                                            <a href="tel:0998 844 3285" style="display: inline-block; padding: 12px 25px; background-color: #FB4700; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold; margin: 0 10px;">Call Us</a>
                                            <a href="https://m.me/MLIMrQuickFix/" style="display: inline-block; padding: 12px 25px; background-color: #0084FF; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold; margin: 0 10px;">Message on Facebook</a>
                                        </div>
                                    </td>
                                </tr>

                                    <!-- Footer -->
                                    <tr>
                                        <td style="padding: 30px; background-color: #f8f9fa; border-radius: 0 0 8px 8px;">
                                            <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 auto;">
                                                <tr>
                                                    <td style="text-align: center; padding-bottom: 20px;">
                                                        <p style="margin: 0; color: #666666; font-size: 16px; font-weight: bold;">Mr. Quick Fix</p>
                                                        <p style="margin: 5px 0 0; color: #666666; font-size: 14px;">Mr. Quick Fix is powered by Miescor Logistics, Inc. specializing in home repair and improvements.</p>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="text-align: center; padding-top: 20px;">
                                                        <p style="margin: 0; color: #999999; font-size: 12px;">© ${new Date().getFullYear()} Mr. Quick Fix. All rights reserved.</p>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>`
        )
        
    }
    else{
        const mailSent = await sendEmail(
            job.clientEmail,
            "Mr. Quick Fix - Inquiry Received",
            `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Mr. Quick Fix - Inquiry Received</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
                <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 auto;">
                    <tr>
                        <td align="center" style="padding: 40px 0;">
                            <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                                <!-- Header -->
                                <tr>
                                    <td style="padding: 40px 30px; text-align: center; background-color: #FB4700; border-radius: 8px 8px 0 0;">
                                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Mr. Quick Fix</h1>
                                        <p style="margin: 10px 0 0; color: #ffffff; font-size: 16px;">Inquiry Confirmation</p>
                                    </td>
                                </tr>

                                <!-- Main Content -->
                                <tr>
                                    <td style="padding: 40px 30px;">
                                        <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px;">Thank You for Your Inquiry</h2>
                                        <p style="margin: 0 0 15px; color: #666666; font-size: 16px; line-height: 1.5;">Dear Mr./Ms. ${job.clientLastName},</p>
                                        <p style="margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.5;">Thank you for submitting your inquiry through our website <a href="${process.env.FRONTEND_WEBSITE}" style="color: #FB4700; text-decoration: none;">Mr. Quick Fix</a>.</p>
                                        
                                        <div style="background-color: #f8f9fa; border-left: 4px solid #FB4700; padding: 20px; margin: 20px 0; border-radius: 4px;">
                                            <p style="margin: 0; color: #666666; font-size: 16px; line-height: 1.5;">Our team will contact you shortly using the phone number you provided to discuss your requirements in detail.</p>
                                        </div>

                                        <p style="margin: 0 0 25px; color: #666666; font-size: 16px; line-height: 1.5;">For immediate assistance, you can reach us through:</p>
                                        <div style="text-align: center; margin-bottom: 30px;">
                                            <a href="tel:0998 844 3285" style="display: inline-block; padding: 12px 25px; background-color: #FB4700; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold; margin: 0 10px;">Call Us</a>
                                            <a href="https://m.me/MLIMrQuickFix/" style="display: inline-block; padding: 12px 25px; background-color: #0084FF; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold; margin: 0 10px;">Message on Facebook</a>
                                        </div>
                                    </td>
                                </tr>

                                <!-- Footer -->
                                <tr>
                                    <td style="padding: 30px; background-color: #f8f9fa; border-radius: 0 0 8px 8px;">
                                        <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 auto;">
                                            <tr>
                                                <td style="text-align: center; padding-bottom: 20px;">
                                                    <p style="margin: 0; color: #666666; font-size: 16px; font-weight: bold;">Mr. Quick Fix</p>
                                                    <p style="margin: 5px 0 0; color: #666666; font-size: 14px;">Mr. Quick Fix is powered by Miescor Logistics, Inc. specializing in home repair and improvements.</p>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="text-align: center; padding-top: 20px;">
                                                    <p style="margin: 0; color: #999999; font-size: 12px;">© ${new Date().getFullYear()} Mr. Quick Fix. All rights reserved.</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>`
        )

    }
  
        res.status(201).json({ success: true, data: newJob });
    } catch (error) {
        console.error("Error saving job order:", error.message);
        res.status(500).json({ success: false, message: "Server Error: Failed to save job order" });
    }
};


// @desc Get all job orders
// @route GET /api/joborders
export const getJobOrders = async (req, res) => {
    try {
        const jobs = await JobOrder.find({}).populate("createdBy updatedBy createdNote updatedNote", "firstName lastName");
        res.status(200).json({ success: true, data: jobs });
    } catch (error) {
        console.error("Error fetching job orders:", error.message);
        res.status(500).json({ success: false, message: "Server Error: Failed to fetch job orders" });
    }
};

// @desc Update a job order
// @route PATCH /api/joborders/:id
export const updateJobOrder = async (req, res) => {
    const { id } = req.params;
    const job = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: "Job order not found" });
    }

    const userID = job.userID;

    if (!userID) {
        return res.status(400).json({ success: false, message: "User ID is required" });
    }
    
    try {
        const existingJob = await JobOrder.findById(id);
        if (!existingJob) {
            return res.status(404).json({ success: false, message: "Job order not found" });
        }

        const projectID = existingJob.projectID;

        const updateFields = {
            ...job,
            updatedBy: userID,
            updatedAt: new Date(),
            jobNotificationRead: true,
        };

        let quotationUrl = null;

        if (req.file) {
            if (existingJob.jobQuotationPublicKey) {
                await cloudinary.uploader.destroy(existingJob.jobQuotationPublicKey);
            }

            const buffer = req.file.buffer;
            const fileData = await upload_JobQuotation_File_Single(buffer);
            updateFields.jobQuotation = fileData.url;
            updateFields.jobQuotationPublicKey = fileData.public_id;
            quotationUrl = fileData.url;
        }

        if (job.jobStatus === "on process") {
            const inspectionDate = new Date(job.jobInspectionDate).toDateString();
            await sendEmail(
                job.clientEmail,
                "Mr. Quick Fix - Inspection Schedule Update",
                `<!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Mr. Quick Fix - Inspection Schedule Update</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 auto;">
                        <tr>
                            <td align="center" style="padding: 40px 0;">
                                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                                    <!-- Header -->
                                    <tr>
                                        <td style="padding: 40px 30px; text-align: center; background-color: #FB4700; border-radius: 8px 8px 0 0;">
                                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Mr. Quick Fix</h1>
                                            <p style="margin: 10px 0 0; color: #ffffff; font-size: 16px;">Inspection Schedule Update</p>
                                        </td>
                                    </tr>

                                    <!-- Main Content -->
                                    <tr>
                                        <td style="padding: 40px 30px;">
                                            <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px;">Inspection Details</h2>
                                            <p style="margin: 0 0 15px; color: #666666; font-size: 16px; line-height: 1.5;">Dear Mr./Ms. ${job.clientLastName},</p>
                                            
                                            <div style="background-color: #f8f9fa; border-left: 4px solid #FB4700; padding: 20px; margin: 20px 0; border-radius: 4px;">
                                                <p style="margin: 0; color: #333333; font-size: 18px; font-weight: bold;">Project Information</p>
                                                <p style="margin: 10px 0 0; color: #666666; font-size: 16px;">Project ID: <b>${projectID}</b></p>
                                                <p style="margin: 5px 0 0; color: #666666; font-size: 16px;">Scheduled Date: <b>${inspectionDate}</b></p>
                                            </div>

                                            <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                                                <tr>
                                                    <td style="padding: 20px; background-color: #f8f9fa; border-radius: 4px;">
                                                        <p style="margin: 0; color: #FB4700; font-size: 18px; font-weight: bold;">What to Expect</p>
                                                        <ul style="margin: 10px 0 0; color: #666666; font-size: 16px; padding-left: 20px;">
                                                            <li style="margin: 5px 0;">Thorough assessment of the work area</li>
                                                            <li style="margin: 5px 0;">Discussion of your requirements</li>
                                                            <li style="margin: 5px 0;">Initial cost estimation</li>
                                                            <li style="margin: 5px 0;">Project timeline planning</li>
                                                        </ul>
                                                    </td>
                                                </tr>
                                            </table>

                                            <p style="margin: 0 0 25px; color: #666666; font-size: 16px; line-height: 1.5;">Need to reschedule or have questions? Contact us:</p>
                                            <div style="text-align: center; margin-bottom: 30px;">
                                                <a href="tel:0998 844 3285" style="display: inline-block; padding: 12px 25px; background-color: #FB4700; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold; margin: 0 10px;">Call Us</a>
                                                <a href="https://m.me/MLIMrQuickFix/" style="display: inline-block; padding: 12px 25px; background-color: #0084FF; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold; margin: 0 10px;">Message on Facebook</a>
                                            </div>
                                        </td>
                                    </tr>

                                    <!-- Footer -->
                                    <tr>
                                        <td style="padding: 30px; background-color: #f8f9fa; border-radius: 0 0 8px 8px;">
                                            <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 auto;">
                                                <tr>
                                                    <td style="text-align: center; padding-bottom: 20px;">
                                                        <p style="margin: 0; color: #666666; font-size: 16px; font-weight: bold;">Mr. Quick Fix</p>
                                                        <p style="margin: 5px 0 0; color: #666666; font-size: 14px;">Mr. Quick Fix is powered by Miescor Logistics, Inc. specializing in home repair and improvements.</p>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="text-align: center; padding-top: 20px;">
                                                        <p style="margin: 0; color: #999999; font-size: 12px;">© ${new Date().getFullYear()} Mr. Quick Fix. All rights reserved.</p>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>`
            );
        } else if (job.jobStatus === "in progress") {
            const datestart = job.jobStartDate ? new Date(job.jobStartDate).toDateString() : 'To be confirmed';
            const dateEnd = job.jobEndDate ? new Date(job.jobEndDate).toDateString() : 'To be confirmed';
            
            // Email template with projectID
            const emailHtml = `<!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Mr. Quick Fix - Project Quotation</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 auto;">
                        <tr>
                            <td align="center" style="padding: 40px 0;">
                                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                                    <!-- Header -->
                                    <tr>
                                        <td style="padding: 40px 30px; text-align: center; background-color: #FB4700; border-radius: 8px 8px 0 0;">
                                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Mr. Quick Fix</h1>
                                            <p style="margin: 10px 0 0; color: #ffffff; font-size: 16px;">Project Quotation</p>
                                        </td>
                                    </tr>

                                    <!-- Main Content -->
                                    <tr>
                                        <td style="padding: 40px 30px;">
                                            <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px;">Project Details</h2>
                                            <p style="margin: 0 0 15px; color: #666666; font-size: 16px; line-height: 1.5;">Dear Mr./Ms. ${job.clientLastName},</p>
                                            <p style="margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.5;">We have prepared the quotation for your project. Please find it attached to this email.</p>
                                            
                                            <div style="background-color: #f8f9fa; border-left: 4px solid #FB4700; padding: 20px; margin: 20px 0; border-radius: 4px;">
                                                <p style="margin: 0; color: #333333; font-size: 18px; font-weight: bold;">Project Schedule</p>
                                                <p style="margin: 10px 0 0; color: #666666; font-size: 16px;">Project ID: <b>${projectID}</b></p>
                                                <p style="margin: 5px 0 0; color: #666666; font-size: 16px;">Start Date: <b>${datestart}</b></p>
                                                <p style="margin: 5px 0 0; color: #666666; font-size: 16px;">Expected Completion: <b>${dateEnd}</b></p>
                                            </div>

                                            <p style="margin: 0 0 25px; color: #666666; font-size: 16px; line-height: 1.5;">If you have any questions about the quotation or would like to discuss the project details, please contact us:</p>
                                            <div style="text-align: center; margin-bottom: 30px;">
                                                <a href="tel:0998 844 3285" style="display: inline-block; padding: 12px 25px; background-color: #FB4700; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold; margin: 0 10px;">Call Us</a>
                                                <a href="https://m.me/MLIMrQuickFix/" style="display: inline-block; padding: 12px 25px; background-color: #0084FF; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold; margin: 0 10px;">Message on Facebook</a>
                                            </div>
                                        </td>
                                    </tr>

                                    <!-- Footer -->
                                    <tr>
                                        <td style="padding: 30px; background-color: #f8f9fa; border-radius: 0 0 8px 8px;">
                                            <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 auto;">
                                                <tr>
                                                    <td style="text-align: center; padding-bottom: 20px;">
                                                        <p style="margin: 0; color: #666666; font-size: 16px; font-weight: bold;">Mr. Quick Fix</p>
                                                        <p style="margin: 5px 0 0; color: #666666; font-size: 14px;">Mr. Quick Fix is powered by Miescor Logistics, Inc. specializing in home repair and improvements.</p>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="text-align: center; padding-top: 20px;">
                                                        <p style="margin: 0; color: #999999; font-size: 12px;">© ${new Date().getFullYear()} Mr. Quick Fix. All rights reserved.</p>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>`;

            // If we have a quotation file, send with attachment
            if (quotationUrl || updateFields.jobQuotation) {
                try {
                    await sendEmail(
                        job.clientEmail,
                        "Mr. Quick Fix - Project Quotation",
                        emailHtml,
                        [{
                            filename: 'Project_Quotation.pdf',
                            path: quotationUrl || updateFields.jobQuotation
                        }]
                    );
                } catch (error) {
                    console.error("Error sending email with attachment:", error);
                    await sendEmail(
                        job.clientEmail,
                        "Mr. Quick Fix - Project Quotation",
                        emailHtml
                    );
                }
            } else {
                await sendEmail(
                    job.clientEmail,
                    "Mr. Quick Fix - Project Quotation",
                    emailHtml
                );
            }
        } else if (job.jobStatus === "completed") {
            updateFields.jobCompletedDate = new Date();
            const link = `${process.env.FRONTEND_URL}/feedback/${id}`;
            
            await sendEmail(
                job.clientEmail,
                "Mr. Quick Fix - Project Completed",
                `<!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Mr. Quick Fix - Project Completed</title>
                    </head>
                    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
                        <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 auto;">
                            <tr>
                                <td align="center" style="padding: 40px 0;">
                                    <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                                        <!-- Header -->
                                        <tr>
                                            <td style="padding: 40px 30px; text-align: center; background-color: #FB4700; border-radius: 8px 8px 0 0;">
                                                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Mr. Quick Fix</h1>
                                                <p style="margin: 10px 0 0; color: #ffffff; font-size: 16px;">Project Completion</p>
                                            </td>
                                        </tr>

                                        <!-- Main Content -->
                                        <tr>
                                            <td style="padding: 40px 30px;">
                                                <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px;">Project Successfully Completed!</h2>
                                                <p style="margin: 0 0 15px; color: #666666; font-size: 16px; line-height: 1.5;">Dear Mr./Ms. ${job.clientLastName},</p>
                                                <p style="margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.5;">We are pleased to inform you that your project (ID: ${projectID}) has been successfully completed. Thank you for choosing Mr. Quick Fix for your repair needs.</p>
                                                
                                                <div style="background-color: #f8f9fa; border-left: 4px solid #FB4700; padding: 20px; margin: 20px 0; border-radius: 4px;">
                                                    <p style="margin: 0; color: #333333; font-size: 18px; font-weight: bold;">Share Your Experience</p>
                                                    <p style="margin: 10px 0 0; color: #666666; font-size: 16px;">We value your feedback! Please take a moment to share your experience by clicking the button below:</p>
                                                </div>

                                                <div style="text-align: center; margin: 30px 0;">
                                                    <a href="${link}" style="display: inline-block; padding: 15px 30px; background-color: #FB4700; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold;">Provide Feedback</a>
                                                </div>

                                                <p style="margin: 0 0 25px; color: #666666; font-size: 16px; line-height: 1.5;">If you have any questions or need further assistance, please don't hesitate to contact us:</p>
                                                <div style="text-align: center; margin-bottom: 30px;">
                                                    <a href="tel:0998 844 3285" style="display: inline-block; padding: 12px 25px; background-color: #FB4700; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold; margin: 0 10px;">Call Us</a>
                                                    <a href="https://m.me/MLIMrQuickFix/" style="display: inline-block; padding: 12px 25px; background-color: #0084FF; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold; margin: 0 10px;">Message on Facebook</a>
                                                </div>
                                            </td>
                                        </tr>

                                        <!-- Footer -->
                                        <tr>
                                            <td style="padding: 30px; background-color: #f8f9fa; border-radius: 0 0 8px 8px;">
                                                <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 auto;">
                                                    <tr>
                                                        <td style="text-align: center; padding-bottom: 20px;">
                                                            <p style="margin: 0; color: #666666; font-size: 16px; font-weight: bold;">Mr. Quick Fix</p>
                                                            <p style="margin: 5px 0 0; color: #666666; font-size: 14px;">Mr. Quick Fix is powered by Miescor Logistics, Inc. specializing in home repair and improvements.</p>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td style="text-align: center; padding-top: 20px;">
                                                            <p style="margin: 0; color: #999999; font-size: 12px;">© ${new Date().getFullYear()} Mr. Quick Fix. All rights reserved.</p>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </body>
                    </html>`
            );
        } else if (job.jobStatus === "cancelled") {
            updateFields.jobCancelledDate = new Date();
            
            await sendEmail(
                job.clientEmail,
                "Mr. Quick Fix - Project Cancellation",
                `<!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Mr. Quick Fix - Project Cancellation</title>
                    </head>
                    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
                        <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 auto;">
                            <tr>
                                <td align="center" style="padding: 40px 0;">
                                    <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                                        <!-- Header -->
                                        <tr>
                                            <td style="padding: 40px 30px; text-align: center; background-color: #FB4700; border-radius: 8px 8px 0 0;">
                                                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Mr. Quick Fix</h1>
                                                <p style="margin: 10px 0 0; color: #ffffff; font-size: 16px;">Project Cancellation Notice</p>
                                            </td>
                                        </tr>

                                        <!-- Main Content -->
                                        <tr>
                                            <td style="padding: 40px 30px;">
                                                <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px;">Project Cancellation</h2>
                                                <p style="margin: 0 0 15px; color: #666666; font-size: 16px; line-height: 1.5;">Dear Mr./Ms. ${job.clientLastName},</p>
                                                <p style="margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.5;">We are writing to confirm that your project (ID: ${projectID}) with Mr. Quick Fix has been cancelled.</p>
                                                
                                                <div style="background-color: #f8f9fa; border-left: 4px solid #FB4700; padding: 20px; margin: 20px 0; border-radius: 4px;">
                                                    <p style="margin: 0; color: #333333; font-size: 18px; font-weight: bold;">Cancellation Details</p>
                                                    <p style="margin: 10px 0 0; color: #666666; font-size: 16px;">Reason: ${job.jobCancellationReason}</p>
                                                    <p style="margin: 5px 0 0; color: #666666; font-size: 16px;">Date: ${new Date().toLocaleDateString()}</p>
                                                </div>

                                                <p style="margin: 0 0 25px; color: #666666; font-size: 16px; line-height: 1.5;">If you believe this cancellation was made in error or would like to discuss this further, please contact us:</p>
                                                <div style="text-align: center; margin-bottom: 30px;">
                                                    <a href="tel:0998 844 3285" style="display: inline-block; padding: 12px 25px; background-color: #FB4700; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold; margin: 0 10px;">Call Us</a>
                                                    <a href="https://m.me/MLIMrQuickFix/" style="display: inline-block; padding: 12px 25px; background-color: #0084FF; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold; margin: 0 10px;">Message on Facebook</a>
                                                </div>
                                            </td>
                                        </tr>

                                        <!-- Footer -->
                                        <tr>
                                            <td style="padding: 30px; background-color: #f8f9fa; border-radius: 0 0 8px 8px;">
                                                <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 auto;">
                                                    <tr>
                                                        <td style="text-align: center; padding-bottom: 20px;">
                                                            <p style="margin: 0; color: #666666; font-size: 16px; font-weight: bold;">Mr. Quick Fix</p>
                                                            <p style="margin: 5px 0 0; color: #666666; font-size: 14px;">Mr. Quick Fix is powered by Miescor Logistics, Inc. specializing in home repair and improvements.</p>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td style="text-align: center; padding-top: 20px;">
                                                            <p style="margin: 0; color: #999999; font-size: 12px;">© ${new Date().getFullYear()} Mr. Quick Fix. All rights reserved.</p>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </body>
                    </html>`
            );
        }

        // Handle updatedBy field
        if (updateFields.updatedBy === "Client") {
            updateFields.updatedBy = null;
        } else if (updateFields.updatedBy && !mongoose.Types.ObjectId.isValid(updateFields.updatedBy)) {
            return res.status(400).json({ success: false, message: "Invalid updatedBy ID" });
        }

        const updatedJob = await JobOrder.findByIdAndUpdate(
            id,
            updateFields,
            { new: true }
        ).populate("createdBy updatedBy createdNote updatedNote", "firstName lastName");

        if (!updatedJob) {
            return res.status(404).json({ success: false, message: "Job order not found" });
        }

        res.status(200).json({ success: true, data: updatedJob });
    } catch (error) {
        console.error("Error updating job order:", error.message);
        res.status(500).json({ success: false, message: "Server Error: Failed to update job order" });
    }
};


export const updateJobOrderAddQuotationOnly = async (req, res) => {
    const { id } = req.params;
    const job = req.body;
    const buffer = req.file.buffer;

    // if (!mongoose.Types.ObjectId.isValid(id)) {
    //     return res.status(404).json({ success: false, message: "Job order not found" });
    // }
    const datad  = await JobOrder.findOne({_id:id});
    if(!datad) return res.status(404).json({ success: false, message: "Job order not found" });
    const userID = job.userID;
    const public_id = datad.public_id;
    console.log(public_id)
    if (!userID) {
        return res.status(400).json({ success: false, message: "User ID is required" });
    }
    if(public_id) {  
        await cloudinary.uploader.destroy(public_id)
    }
    const data = await upload_JobQuotation_File_Single(buffer);
    try {
        const updateFields = {
            ...job,
            updatedBy: userID,
            jobQuotation: data.url,
            jobQuotationPublicKey: data.public_id,
            updatedAt: new Date(),
            jobNotificationRead: true,
        };

        if (job.jobStatus === "cancelled") {
            updateFields.jobCancelledDate = new Date();
        }

        if (job.jobStatus === "completed") {
            updateFields.jobCompletedDate = new Date();
        }

        if (updateFields.updatedBy === "Client") {
            updateFields.updatedBy = null;
        } else if (updateFields.updatedBy && !mongoose.Types.ObjectId.isValid(updateFields.updatedBy)) {
            return res.status(400).json({ success: false, message: "Invalid updatedBy ID" });
        }

        const updatedJob = await JobOrder.findByIdAndUpdate(
            id,
            updateFields,
            { new: true }
        ).populate("createdBy updatedBy createdNote updatedNote", "firstName lastName");

        if (!updatedJob) {
            return res.status(404).json({ success: false, message: "Job order not found" });
        }

        res.status(200).json({ success: true, data: updatedJob });
    } catch (error) {
        console.error("Error updating job order:", error.message);
        res.status(500).json({ success: false, message: "Server Error: Failed to update job order" });
    }
};
// @desc    Delete job order
// @route   DELETE /api/joborders/:id
export const deleteJobOrder = async (req, res) => {
    const { id } = req.params;

    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ success: false, message: "Job order not found" });
        }
        
        await JobOrder.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Job order deleted successfully" });
    } catch (error) {
        console.error("Error deleting job order:", error.message);
        res.status(500).json({ success: false, message: "Server Error: Failed to delete job order" });
    }
};

// @desc    Archive job order
// @route   PATCH /api/joborders/:id
export const archiveJobOrder = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: "Job order not found" });
    }

    try {
        const jobOrder = await JobOrder.findById(id);
        if (!jobOrder) {
            return res.status(404).json({ success: false, message: "Job order not found" });
        }

        if (jobOrder.jobStatus === "completed" || jobOrder.jobStatus === "cancelled") {
            jobOrder.isArchived = true;
            jobOrder.archivedAt = new Date();
            await jobOrder.save();

            return res.status(200).json({ success: true, data: jobOrder });
        } else {
            return res.status(400).json({ success: false, message: "Only completed or cancelled jobs can be archived" });
        }
    } catch (error) {
        console.error("Error archiving job order:", error.message);
        res.status(500).json({ success: false, message: "Server Error: Failed to archive job order" });
    }
};

// @desc Update job order note
// @route PATCH /api/joborders/:id
export const updateJobOrderNote = async (req, res) => {
    const { id } = req.params; 
    const { noteType, noteContent, userID } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: "Job order not found" });
    }
    if (!mongoose.Types.ObjectId.isValid(userID)) {
        return res.status(400).json({ success: false, message: "Invalid admin ID" });
    }
    if (!["createdNote", "updatedNote"].includes(noteType)) {
        return res.status(400).json({ success: false, message: "Invalid note type" });
    }

    try {
        const updateFields = {
            jobNote: noteContent,
            [`${noteType}`]: userID,
        };

        if (noteType === "createdNote") {
            updateFields.createdNoteDate = Date.now();
        } else if (noteType === "updatedNote") {
            updateFields.updatedNoteDate = Date.now();
        }

        const updatedJob = await JobOrder.findByIdAndUpdate(
            id,
            { $set: updateFields },
            { new: true }
        ).populate([
            { path: "createdNote updatedNote", select: "firstName lastName" },
        ]);

        if (!updatedJob) {
            return res.status(404).json({ success: false, message: "Job order not found" });
        }

        res.status(200).json({ success: true, data: updatedJob });
    } catch (error) {
        console.error("Error updating job order note:", error.message);
        res.status(500).json({ success: false, message: "Server Error: Failed to update job order note" });
    }
};

// @desc Update inquiry status
// @route PATCH /api/job-orders/:id/inquiry
export const updateInquiryStatus = async (req, res) => {
    const { id } = req.params;
    const job = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: "Job order not found" });
    }

    try {
        const updateFields = {
            ...job,
            updatedAt: new Date()
        };

        // Send email when inquiry is marked as received
        if (job.inquiryStatus === "received") {
            try {
                await sendEmail(
                    job.clientEmail,
                    "Mr. Quick Fix - Inquiry Received",
                    `<!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Mr. Quick Fix - Inquiry Received</title>
                    </head>
                    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
                        <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 auto;">
                            <tr>
                                <td align="center" style="padding: 40px 0;">
                                    <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                                        <!-- Header -->
                                        <tr>
                                            <td style="padding: 40px 30px; text-align: center; background-color: #FB4700; border-radius: 8px 8px 0 0;">
                                                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Mr. Quick Fix</h1>
                                                <p style="margin: 10px 0 0; color: #ffffff; font-size: 16px;">Inquiry Confirmation</p>
                                            </td>
                                        </tr>

                                        <!-- Main Content -->
                                        <tr>
                                            <td style="padding: 40px 30px;">
                                                <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px;">Thank You for Your Inquiry</h2>
                                                <p style="margin: 0 0 15px; color: #666666; font-size: 16px; line-height: 1.5;">Dear Mr./Ms. ${job.clientLastName},</p>
                                                <p style="margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.5;">We have received your inquiry and are excited to help you with your project needs.</p>
                                                
                                                <div style="background-color: #f8f9fa; border-left: 4px solid #FB4700; padding: 20px; margin: 20px 0; border-radius: 4px;">
                                                    <p style="margin: 0; color: #333333; font-size: 18px; font-weight: bold;">Next Steps</p>
                                                    <ul style="margin: 10px 0 0; color: #666666; font-size: 16px; padding-left: 20px;">
                                                        <li style="margin: 5px 0;">Our team will review your inquiry details</li>
                                                        <li style="margin: 5px 0;">We'll contact you via phone to discuss further</li>
                                                        <li style="margin: 5px 0;">Schedule an inspection if needed</li>
                                                        <li style="margin: 5px 0;">Provide a detailed quotation</li>
                                                    </ul>
                                                </div>

                                                <p style="margin: 0 0 25px; color: #666666; font-size: 16px; line-height: 1.5;">Need immediate assistance? Contact us through:</p>
                                                <div style="text-align: center; margin-bottom: 30px;">
                                                    <a href="tel:09988443285" style="display: inline-block; padding: 12px 25px; background-color: #FB4700; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold; margin: 0 10px;">Call Us</a>
                                                    <a href="https://m.me/MLIMrQuickFix/" style="display: inline-block; padding: 12px 25px; background-color: #0084FF; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold; margin: 0 10px;">Message on Facebook</a>
                                                </div>
                                            </td>
                                        </tr>

                                        <!-- Footer -->
                                        <tr>
                                            <td style="padding: 30px; background-color: #f8f9fa; border-radius: 0 0 8px 8px;">
                                                <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 auto;">
                                                    <tr>
                                                        <td style="text-align: center; padding-bottom: 20px;">
                                                            <p style="margin: 0; color: #666666; font-size: 16px; font-weight: bold;">Mr. Quick Fix</p>
                                                            <p style="margin: 5px 0 0; color: #666666; font-size: 14px;">Mr. Quick Fix is powered by Miescor Logistics, Inc. specializing in home repair and improvements.</p>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td style="text-align: center; padding-top: 20px;">
                                                            <p style="margin: 0; color: #999999; font-size: 12px;">© ${new Date().getFullYear()} Mr. Quick Fix. All rights reserved.</p>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </body>
                    </html>`
                );
                console.log('Email sent successfully for inquiry received');
            } catch (emailError) {
                console.error('Error sending email:', emailError);
            }
        }

        const updatedJob = await JobOrder.findByIdAndUpdate(
            id,
            updateFields,
            { new: true }
        ).populate("createdBy updatedBy createdNote updatedNote", "firstName lastName");

        if (!updatedJob) {
            return res.status(404).json({ success: false, message: "Job order not found" });
        }

        res.status(200).json({ success: true, data: updatedJob });
    } catch (error) {
        console.error("Error updating inquiry status:", error.message);
        res.status(500).json({ success: false, message: "Server Error: Failed to update inquiry status" });
    }
};



