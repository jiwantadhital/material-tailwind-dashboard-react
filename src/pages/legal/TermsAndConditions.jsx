import React from 'react';
import { Card, Typography, Button } from "@material-tailwind/react";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield, FileText, Users, Lock, Phone, Mail } from 'lucide-react';

export function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link to="/auth/sign-up" className="text-blue-500 hover:text-blue-700">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <img src="/img/nlogo.png" alt="Logo" className="h-8" />
            </div>
            <Typography variant="h6" color="blue-gray" className="font-semibold">
              Terms and Conditions
            </Typography>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="p-8 shadow-lg">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-blue-500 rounded-full">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
            <Typography variant="h3" color="blue-gray" className="font-bold mb-2">
              Terms and Conditions
            </Typography>
            <Typography variant="paragraph" color="blue-gray" className="text-blue-gray-500">
              Last updated: {new Date().toLocaleDateString()}
            </Typography>
          </div>

          <div className="space-y-6 text-blue-gray-700">
            {/* Introduction */}
            <section>
              <Typography variant="h5" color="blue-gray" className="font-semibold mb-3">
                1. Introduction
              </Typography>
              <Typography variant="paragraph" className="leading-relaxed">
                Welcome to NotarySajilo, a professional notarization service platform. These Terms and Conditions govern your use of our website and services. By accessing or using our platform, you agree to be bound by these terms.
              </Typography>
            </section>

            {/* Service Description */}
            <section>
              <Typography variant="h5" color="blue-gray" className="font-semibold mb-3">
                2. Service Description
              </Typography>
              <Typography variant="paragraph" className="leading-relaxed mb-3">
                NotarySajilo provides online notarization services, including but not limited to:
              </Typography>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Document notarization services</li>
                <li>Legal document verification</li>
                <li>Digital signature services</li>
                <li>Document authentication</li>
                <li>Legal consultation referrals</li>
              </ul>
            </section>

            {/* User Responsibilities */}
            <section>
              <Typography variant="h5" color="blue-gray" className="font-semibold mb-3">
                3. User Responsibilities
              </Typography>
              <Typography variant="paragraph" className="leading-relaxed mb-3">
                As a user of our platform, you agree to:
              </Typography>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide accurate and truthful information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Use the service only for lawful purposes</li>
                <li>Not attempt to circumvent any security measures</li>
                <li>Respect the privacy and rights of other users</li>
                <li>Comply with all applicable laws and regulations</li>
              </ul>
            </section>

            {/* Privacy and Data Protection */}
            <section>
              <Typography variant="h5" color="blue-gray" className="font-semibold mb-3">
                4. Privacy and Data Protection
              </Typography>
              <Typography variant="paragraph" className="leading-relaxed mb-3">
                We are committed to protecting your privacy and personal information. Our data collection and processing practices are outlined in our Privacy Policy, which is incorporated into these terms by reference.
              </Typography>
              <Typography variant="paragraph" className="leading-relaxed">
                We implement appropriate security measures to protect your data against unauthorized access, alteration, disclosure, or destruction.
              </Typography>
            </section>

            {/* Payment Terms */}
            <section>
              <Typography variant="h5" color="blue-gray" className="font-semibold mb-3">
                5. Payment Terms
              </Typography>
              <Typography variant="paragraph" className="leading-relaxed mb-3">
                Payment for our services is processed through secure payment gateways. By using our services, you agree to:
              </Typography>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Pay all fees associated with the services you use</li>
                <li>Provide accurate payment information</li>
                <li>Authorize charges for the services you request</li>
                <li>Understand that fees are non-refundable unless otherwise specified</li>
              </ul>
            </section>

            {/* Service Availability */}
            <section>
              <Typography variant="h5" color="blue-gray" className="font-semibold mb-3">
                6. Service Availability
              </Typography>
              <Typography variant="paragraph" className="leading-relaxed">
                We strive to maintain high service availability but cannot guarantee uninterrupted access. We reserve the right to modify, suspend, or discontinue services at any time with reasonable notice.
              </Typography>
            </section>

            {/* Limitation of Liability */}
            <section>
              <Typography variant="h5" color="blue-gray" className="font-semibold mb-3">
                7. Limitation of Liability
              </Typography>
              <Typography variant="paragraph" className="leading-relaxed mb-3">
                To the maximum extent permitted by law, NotarySajilo shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services.
              </Typography>
              <Typography variant="paragraph" className="leading-relaxed">
                Our total liability for any claims arising from these terms shall not exceed the amount you paid for the specific service giving rise to the claim.
              </Typography>
            </section>

            {/* Intellectual Property */}
            <section>
              <Typography variant="h5" color="blue-gray" className="font-semibold mb-3">
                8. Intellectual Property
              </Typography>
              <Typography variant="paragraph" className="leading-relaxed">
                All content, trademarks, logos, and intellectual property on our platform are owned by NotarySajilo or our licensors. You may not use, reproduce, or distribute this content without our express written permission.
              </Typography>
            </section>

            {/* Termination */}
            <section>
              <Typography variant="h5" color="blue-gray" className="font-semibold mb-3">
                9. Termination
              </Typography>
              <Typography variant="paragraph" className="leading-relaxed mb-3">
                We may terminate or suspend your account at any time for violations of these terms. You may also terminate your account at any time by contacting our support team.
              </Typography>
              <Typography variant="paragraph" className="leading-relaxed">
                Upon termination, your right to use our services will cease immediately, and we may delete your account data in accordance with our Privacy Policy.
              </Typography>
            </section>

            {/* Governing Law */}
            <section>
              <Typography variant="h5" color="blue-gray" className="font-semibold mb-3">
                10. Governing Law
              </Typography>
              <Typography variant="paragraph" className="leading-relaxed">
                These terms are governed by the laws of Nepal. Any disputes arising from these terms shall be resolved in the courts of Nepal.
              </Typography>
            </section>

            {/* Changes to Terms */}
            <section>
              <Typography variant="h5" color="blue-gray" className="font-semibold mb-3">
                11. Changes to Terms
              </Typography>
              <Typography variant="paragraph" className="leading-relaxed">
                We reserve the right to modify these terms at any time. We will notify users of significant changes via email or through our platform. Continued use of our services after changes constitutes acceptance of the new terms.
              </Typography>
            </section>

            {/* Contact Information */}
            <section>
              <Typography variant="h5" color="blue-gray" className="font-semibold mb-3">
                12. Contact Information
              </Typography>
              <Typography variant="paragraph" className="leading-relaxed mb-3">
                If you have any questions about these Terms and Conditions, please contact us:
              </Typography>
              <div className="space-y-2 ml-4">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-blue-500" />
                  <Typography variant="small">+977-XXXXXXXXX</Typography>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-blue-500" />
                  <Typography variant="small">support@notarysajilo.com</Typography>
                </div>
              </div>
            </section>
          </div>

          {/* Back Button */}
          <div className="mt-8 pt-6 border-t border-blue-gray-200">
            <Link to="/auth/sign-up">
              <Button 
                variant="outlined" 
                color="blue" 
                className="flex items-center gap-2"
                fullWidth
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Registration
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default TermsAndConditions; 