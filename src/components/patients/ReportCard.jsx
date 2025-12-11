import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, FileText, Eye, Microscope } from 'lucide-react';
import { format } from 'date-fns';

export default function ReportCard({ report }) {
  const [viewOpen, setViewOpen] = useState(false);

  return (
    <>
      <Card className="p-4 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-semibold text-slate-700">
                {report.exam_date ? format(new Date(report.exam_date), 'dd/MM/yyyy') : format(new Date(report.created_date), 'dd/MM/yyyy')}
              </span>
              {report.biopsy_requested && (
                <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-xs">
                  <Microscope className="w-3 h-3 mr-1" />
                  Biópsia
                </Badge>
              )}
            </div>
            <p className="text-sm text-slate-600 mb-2">
              <strong>Indicação:</strong> {report.indication || 'Não especificada'}
            </p>
            {report.conclusions && report.conclusions.length > 0 && (
              <div className="text-xs text-slate-500">
                <strong>Conclusões:</strong>
                <ul className="list-disc pl-5 mt-1">
                  {report.conclusions.slice(0, 2).map((conclusion, idx) => (
                    <li key={idx}>{conclusion}</li>
                  ))}
                  {report.conclusions.length > 2 && (
                    <li className="text-slate-400">... e mais {report.conclusions.length - 2}</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setViewOpen(true)}
          className="w-full gap-2"
        >
          <Eye className="w-4 h-4" />
          Visualizar Laudo Completo
        </Button>
      </Card>

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-sky-600" />
              Laudo Endoscópico - {report.exam_date ? format(new Date(report.exam_date), 'dd/MM/yyyy') : format(new Date(report.created_date), 'dd/MM/yyyy')}
            </DialogTitle>
          </DialogHeader>
          <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
            <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
              {report.report_content}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}