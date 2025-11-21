import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, CheckCircle, AlertCircle, Loader2, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Contact } from "@/lib/mockData";
import { FileUploadModal } from "./FileUploadModal";

interface CSVRow {
  [key: string]: string;
}

interface ImportedContact {
  company: string;
  phone: string;
  address: string;
  email: string;
  name: string;
  title?: string;
  city: string;
  zip: string;
}

interface CSVImporterProps {
  onImportComplete?: (contacts: Contact[]) => void;
}

export function CSVImporter({ onImportComplete }: CSVImporterProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [importedData, setImportedData] = useState<ImportedContact[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [successCount, setSuccessCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const parseCSV = (text: string): CSVRow[] => {
    const lines = text.split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const rows: CSVRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = lines[i].split(',').map(v => v.trim());
      const row: CSVRow = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      rows.push(row);
    }

    return rows;
  };

  const convertToContacts = (rows: CSVRow[]): { contacts: Contact[], errors: string[] } => {
    const contacts: Contact[] = [];
    const errors: string[] = [];
    let contactId = 1000;

    rows.forEach((row, index) => {
      try {
        const businessName = row['Business Name'] || row['business_name'] || '';
        const phone = row['Phone Number'] || row['phone'] || '';
        const address = row['Address'] || row['address'] || '';
        const email = row['Email'] || row['email'] || '';
        const fullName = row['Full Name'] || row['name'] || '';
        const city = row['City'] || row['city'] || '';
        const zip = row['ZIP Code'] || row['zip'] || '';
        const category = row['Category'] || 'Healthcare';

        if (!businessName || !phone || !address) {
          errors.push(`Row ${index + 2}: Missing required fields (Business Name, Phone, Address)`);
          return;
        }

        const contact: Contact = {
          id: `imported-${contactId++}`,
          name: fullName || businessName,
          title: category,
          company: businessName,
          phone: phone,
          email: email || `contact@${businessName.toLowerCase().replace(/\s+/g, '')}.com`,
          address: address,
          zip: zip,
          timezone: "EST",
          lastNotes: `Imported from CSV • ${city}`,
          status: "New",
          location_lat: 0,
          location_lng: 0,
          emailHistory: [],
          clientAdmins: [],
          providerContacts: fullName ? [{
            id: `contact-${contactId}`,
            name: fullName,
            role: category,
            email: email || '',
            phone: phone,
            isPrimary: true
          }] : []
        };

        contacts.push(contact);
      } catch (err) {
        errors.push(`Row ${index + 2}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    });

    return { contacts, errors };
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setIsLoading(true);
    setParseErrors([]);
    setImportedData([]);

    try {
      const text = await file.text();
      const rows = parseCSV(text);
      
      if (rows.length === 0) {
        toast({
          title: "Error",
          description: "No valid data found in CSV",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      const { contacts, errors } = convertToContacts(rows);
      
      setSuccessCount(contacts.length);
      setParseErrors(errors);
      
      // Convert to display format
      const displayData: ImportedContact[] = contacts.map(c => ({
        company: c.company,
        phone: c.phone,
        address: c.address,
        email: c.email,
        name: c.name,
        title: c.title || 'Healthcare',
        city: c.lastNotes.split(' • ')[1] || '',
        zip: c.zip
      }));
      
      setImportedData(displayData);
      
      if (onImportComplete) {
        onImportComplete(contacts);
      }

      toast({
        title: "Import Successful",
        description: `Loaded ${contacts.length} practices. ${errors.length} rows had issues.`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to parse CSV",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Card */}
      <Card className="border-2 border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Practices from CSV
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={() => setIsModalOpen(true)}
              disabled={isLoading}
              className="gap-2"
              data-testid="upload-csv-button"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload Leads
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Required columns: Business Name, Phone Number, Address. Optional: Email, Full Name, City, ZIP Code, Category
          </p>
        </CardContent>
      </Card>

      {/* File Upload Modal */}
      <FileUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onFileSelect={handleFileUpload}
        isLoading={isLoading}
      />

      {/* Import Results */}
      {(successCount > 0 || parseErrors.length > 0) && (
        <div className="space-y-4">
          {successCount > 0 && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-green-900">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-semibold">{successCount} practices imported successfully</span>
                </div>
              </CardContent>
            </Card>
          )}

          {parseErrors.length > 0 && (
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 text-amber-900">
                  <AlertCircle className="h-5 w-5" />
                  {parseErrors.length} rows had issues
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {parseErrors.map((error, idx) => (
                    <p key={idx} className="text-xs text-amber-800">{error}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Imported Data Preview */}
      {importedData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Preview of Imported Practices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left py-2 px-3 font-semibold">Business Name</th>
                    <th className="text-left py-2 px-3 font-semibold">Contact Name</th>
                    <th className="text-left py-2 px-3 font-semibold">Phone</th>
                    <th className="text-left py-2 px-3 font-semibold">City</th>
                    <th className="text-left py-2 px-3 font-semibold">Category</th>
                  </tr>
                </thead>
                <tbody>
                  {importedData.slice(0, 10).map((contact, idx) => (
                    <tr key={idx} className="border-b hover:bg-muted/30">
                      <td className="py-3 px-3 text-xs">{contact.company}</td>
                      <td className="py-3 px-3 text-xs">{contact.name}</td>
                      <td className="py-3 px-3 text-xs">{contact.phone}</td>
                      <td className="py-3 px-3 text-xs text-muted-foreground">{contact.zip}</td>
                      <td className="py-3 px-3 text-xs">
                        <Badge variant="outline" className="text-[10px]">{contact.title}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {importedData.length > 10 && (
                <p className="text-xs text-muted-foreground mt-2 pt-2 border-t">
                  ... and {importedData.length - 10} more practices
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
