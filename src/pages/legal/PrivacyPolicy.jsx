import React from 'react';
import { Card, Typography, Button } from "@material-tailwind/react";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Lock, Eye, Database, Users, Phone, Mail, Globe } from 'lucide-react';

export function PrivacyPolicy() {
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
              Privacy Policy
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
                <Shield className="w-6 h-6 text-white" />
              </div>
            </div>
            <Typography variant="h3" color="blue-gray" className="font-bold mb-2">
              Privacy Policy
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
                At NotarySajilo, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our notarization services.
              </Typography>
            </section>

            {/* Information We Collect */}
            <section>
              <Typography variant="h5" color="blue-gray" className="font-semibold mb-3">
                2. Information We Collect
              </Typography>
              
              <Typography variant="h6" color="blue-gray" className="font-semibold mb-2">
                2.1 Personal Information
              </Typography>
              <Typography variant="paragraph" className="leading-relaxed mb-3">
                We collect the following personal information:
              </Typography>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                <li>Full name and contact information</li>
                <li>Phone number and email address</li>
                <li>Government-issued identification documents</li>
                <li>Payment information (processed securely through third-party providers)</li>
                <li>Documents submitted for notarization</li>
                <li>Communication records with our support team</li>
              </ul>

              <Typography variant="h6" color="blue-gray" className="font-semibold mb-2">
                2.2 Technical Information
              </Typography>
              <Typography variant="paragraph" className="leading-relaxed mb-3">
                We automatically collect certain technical information:
              </Typography>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>IP address and device information</li>
                <li>Browser type and version</li>
                <li>Operating system</li>
                <li>Usage patterns and preferences</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            {/* How We Use Your Information */}
            <section>
              <Typography variant="h5" color="blue-gray" className="font-semibold mb-3">
                3. How We Use Your Information
              </Typography>
              <Typography variant="paragraph" className="leading-relaxed mb-3">
                We use your information for the following purposes:
              </Typography>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Providing notarization services</li>
                <li>Verifying your identity and eligibility</li>
                <li>Processing payments and transactions</li>
                <li>Communicating with you about your account and services</li>
                <li>Providing customer support</li>
                <li>Improving our services and user experience</li>
                <li>Complying with legal obligations</li>
                <li>Preventing fraud and ensuring security</li>
              </ul>
            </section>

            {/* Information Sharing */}
            <section>
              <Typography variant="h5" color="blue-gray" className="font-semibold mb-3">
                4. Information Sharing and Disclosure
              </Typography>
              <Typography variant="paragraph" className="leading-relaxed mb-3">
                We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:
              </Typography>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>With your explicit consent</li>
                <li>To comply with legal requirements or court orders</li>
                <li>To protect our rights, property, or safety</li>
                <li>With trusted service providers who assist in our operations</li>
                <li>In connection with a business transfer or merger</li>
              </ul>
            </section>

            {/* Data Security */}
            <section>
              <Typography variant="h5" color="blue-gray" className="font-semibold mb-3">
                5. Data Security
              </Typography>
              <Typography variant="paragraph" className="leading-relaxed mb-3">
                We implement comprehensive security measures to protect your information:
              </Typography>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure authentication and access controls</li>
                <li>Regular security audits and updates</li>
                <li>Employee training on data protection</li>
                <li>Secure data centers and infrastructure</li>
              </ul>
            </section>

            {/* Data Retention */}
            <section>
              <Typography variant="h5" color="blue-gray" className="font-semibold mb-3">
                6. Data Retention
              </Typography>
              <Typography variant="paragraph" className="leading-relaxed">
                We retain your personal information for as long as necessary to provide our services, comply with legal obligations, resolve disputes, and enforce our agreements. Notarized documents are retained in accordance with legal requirements for document retention.
              </Typography>
            </section>

            {/* Your Rights */}
            <section>
              <Typography variant="h5" color="blue-gray" className="font-semibold mb-3">
                7. Your Rights
              </Typography>
              <Typography variant="paragraph" className="leading-relaxed mb-3">
                You have the following rights regarding your personal information:
              </Typography>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Access and review your personal information</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your personal information</li>
                <li>Object to processing of your information</li>
                <li>Request data portability</li>
                <li>Withdraw consent for data processing</li>
              </ul>
            </section>

            {/* Cookies and Tracking */}
            <section>
              <Typography variant="h5" color="blue-gray" className="font-semibold mb-3">
                8. Cookies and Tracking Technologies
              </Typography>
              <Typography variant="paragraph" className="leading-relaxed mb-3">
                We use cookies and similar technologies to enhance your experience:
              </Typography>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Essential cookies for website functionality</li>
                <li>Analytics cookies to understand usage patterns</li>
                <li>Security cookies to protect against fraud</li>
                <li>Preference cookies to remember your settings</li>
              </ul>
              <Typography variant="paragraph" className="leading-relaxed mt-3">
                You can control cookie settings through your browser preferences.
              </Typography>
            </section>

            {/* Third-Party Services */}
            <section>
              <Typography variant="h5" color="blue-gray" className="font-semibold mb-3">
                9. Third-Party Services
              </Typography>
              <Typography variant="paragraph" className="leading-relaxed">
                Our platform may contain links to third-party websites or integrate with third-party services. We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies before providing any personal information.
              </Typography>
            </section>

            {/* Children's Privacy */}
            <section>
              <Typography variant="h5" color="blue-gray" className="font-semibold mb-3">
                10. Children's Privacy
              </Typography>
              <Typography variant="paragraph" className="leading-relaxed">
                Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
              </Typography>
            </section>

            {/* International Transfers */}
            <section>
              <Typography variant="h5" color="blue-gray" className="font-semibold mb-3">
                11. International Data Transfers
              </Typography>
              <Typography variant="paragraph" className="leading-relaxed">
                Your information may be transferred to and processed in countries other than your own. We ensure that such transfers comply with applicable data protection laws and implement appropriate safeguards to protect your information.
              </Typography>
            </section>

            {/* Changes to Privacy Policy */}
            <section>
              <Typography variant="h5" color="blue-gray" className="font-semibold mb-3">
                12. Changes to This Privacy Policy
              </Typography>
              <Typography variant="paragraph" className="leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on our website and updating the "Last updated" date. Your continued use of our services after changes constitutes acceptance of the updated policy.
              </Typography>
            </section>

            {/* Contact Information */}
            <section>
              <Typography variant="h5" color="blue-gray" className="font-semibold mb-3">
                13. Contact Us
              </Typography>
              <Typography variant="paragraph" className="leading-relaxed mb-3">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </Typography>
              <div className="space-y-2 ml-4">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-blue-500" />
                  <Typography variant="small">+977-XXXXXXXXX</Typography>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-blue-500" />
                  <Typography variant="small">privacy@notarysajilo.com</Typography>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-blue-500" />
                  <Typography variant="small">www.notarysajilo.com</Typography>
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

export default PrivacyPolicy; 