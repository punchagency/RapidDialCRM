import React, { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { CSVImporter } from "@/components/crm/CSVImporter";
import { useUserRole } from "@/lib/UserRoleContext";
import { Contact } from "@/lib/mockData";

export default function DataImporter() {
  const { userRole } = useUserRole();
  const [importedContacts, setImportedContacts] = useState<Contact[]>([]);

  const handleImportComplete = (contacts: Contact[]) => {
    setImportedContacts(contacts);
    // Store in localStorage for persistence within session
    localStorage.setItem('imported_contacts', JSON.stringify(contacts));
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-border flex items-center px-6 bg-card z-10 shrink-0">
          <div>
            <h1 className="text-xl font-heading font-semibold text-foreground">Data Import</h1>
            <p className="text-xs text-muted-foreground">Load practices and contacts from CSV files</p>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl">
            <CSVImporter onImportComplete={handleImportComplete} />
            
            {importedContacts.length > 0 && (
              <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">Import Status</h3>
                <p className="text-sm text-green-800">
                  {importedContacts.length} contacts loaded and ready to use in the system. 
                  They will be available in the Contacts view and can be included in Field routes.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

