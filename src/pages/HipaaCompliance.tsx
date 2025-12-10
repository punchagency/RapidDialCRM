import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, FileKey, Database, Server, Eye, FileCheck, Activity } from "lucide-react";

export default function HipaaCompliance() {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden relative bg-muted/30">
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card z-10">
          <h1 className="text-xl font-heading font-semibold text-foreground flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-600" />
            HIPAA Compliance & Security
          </h1>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-8">
            
            <div className="text-center max-w-2xl mx-auto mb-8">
              <h2 className="text-3xl font-bold tracking-tight mb-3">Secure. Private. Compliant.</h2>
              <p className="text-muted-foreground">
                QuantumPunch is built from the ground up to meet and exceed HIPAA standards for safeguarding Protected Health Information (PHI).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-l-4 border-l-emerald-500 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-emerald-600" />
                    End-to-End Encryption
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    All data is encrypted both in transit (using TLS 1.3) and at rest (using AES-256 encryption). PHI is never exposed in plain text on our servers or in logs.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-emerald-500 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileKey className="h-5 w-5 text-emerald-600" />
                    Access Controls
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Strict Role-Based Access Control (RBAC) ensures users only access data necessary for their specific role. Multi-Factor Authentication (MFA) is enforced for all accounts.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-emerald-500 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-emerald-600" />
                    Audit Logging
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Every access, modification, and view of PHI is logged in an immutable audit trail. Administrators can generate detailed reports on who accessed what data and when.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-emerald-500 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5 text-emerald-600" />
                    Physical Security
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Our infrastructure is hosted in SOC 2 Type II and ISO 27001 certified data centers. Physical access is strictly controlled and monitored 24/7.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-emerald-50/50 border-emerald-100">
              <CardHeader>
                <CardTitle className="text-emerald-900 flex items-center gap-2">
                  <FileCheck className="h-5 w-5" />
                  Business Associate Agreement (BAA)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-emerald-800 mb-4">
                  We sign a Business Associate Agreement (BAA) with every covered entity client. This contractually obligates us to adhere to HIPAA regulations and protect your PHI.
                </p>
                <p className="text-sm text-emerald-700">
                  Our BAA covers liability, breach notification procedures, and data destruction policies upon contract termination.
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
               <div className="flex flex-col items-center text-center p-4 bg-card rounded-lg border border-border shadow-sm">
                  <Database className="h-8 w-8 text-primary mb-2" />
                  <h3 className="font-semibold">Data Backup</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Encrypted daily backups with 30-day retention and point-in-time recovery.
                  </p>
               </div>
               <div className="flex flex-col items-center text-center p-4 bg-card rounded-lg border border-border shadow-sm">
                  <Eye className="h-8 w-8 text-primary mb-2" />
                  <h3 className="font-semibold">Vulnerability Scans</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Automated weekly security scans and annual third-party penetration testing.
                  </p>
               </div>
               <div className="flex flex-col items-center text-center p-4 bg-card rounded-lg border border-border shadow-sm">
                  <Shield className="h-8 w-8 text-primary mb-2" />
                  <h3 className="font-semibold">Incident Response</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Dedicated security team with 24/7 monitoring and rapid incident response protocols.
                  </p>
               </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

