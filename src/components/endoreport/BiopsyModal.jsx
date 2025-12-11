import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, X, FileText } from 'lucide-react';

export default function BiopsyModal({
  open,
  onClose,
  paciente,
  doctorName,
  esoData,
  estoData,
  duoData
}) {
  const data = new Date().toLocaleDateString('pt-BR');

  const getMaterials = () => {
    let materials = [];

    if (esoData.neoplasia) {
      materials.push({
        local: 'Esôfago',
        desc: `Fragmentos de lesão em ${esoData.neoLocal} (Suspeita de Neoplasia).`
      });
    }
    if (esoData.barrett) {
      materials.push({
        local: 'Esôfago Distal',
        desc: 'Biópsias quadrânticas (Protocolo de Seattle) - Suspeita de Barrett.'
      });
    }
    if (esoData.eosinofilica) {
      materials.push({
        local: 'Esôfago (Proximal e Distal)',
        desc: 'Pesquisa de eosinófilos (Suspeita de Esofagite Eosinofílica).'
      });
    }
    if (estoData.neoplasia) {
      materials.push({
        local: 'Estômago',
        desc: `Fragmentos de lesão em ${estoData.neoLocal} (Suspeita de Neoplasia).`
      });
    }
    if (estoData.sydney) {
      materials.push({
        local: 'Estômago (Protocolo Sydney)',
        desc: '2 Frascos (Corpo e Antro) - Pesquisa de H. pylori e atrofia.'
      });
    }
    if (estoData.polipo) {
      materials.push({
        local: 'Estômago',
        desc: `Pólipo em ${estoData.polipoLocal}.`
      });
    }
    if (duoData.celiaca) {
      materials.push({
        local: 'Duodeno (2ª Porção)',
        desc: 'Pesquisa de atrofia vilositária (Suspeita de Doença Celíaca).'
      });
    }

    return materials;
  };

  const materials = getMaterials();

  const handlePrint = () => {
    const printContent = document.getElementById('biopsy-print-content');
    if (printContent) {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Pedido de Anatomopatológico</title>
          <style>
            body { font-family: 'Times New Roman', serif; font-size: 12pt; padding: 40px; }
            .header { text-align: center; border-bottom: 2px solid black; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { font-size: 18pt; text-transform: uppercase; margin: 0; }
            .header p { font-size: 10pt; color: #666; margin: 5px 0 0; }
            .info { margin-bottom: 30px; }
            .info p { margin: 5px 0; }
            .materials { margin-bottom: 30px; padding: 15px; border: 1px solid #ccc; border-radius: 5px; background: #f9f9f9; }
            .materials h3 { margin: 0 0 15px; font-size: 11pt; text-transform: uppercase; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
            .materials ul { margin: 0; padding-left: 20px; }
            .materials li { margin-bottom: 10px; }
            .clinical { margin-bottom: 50px; }
            .clinical h3 { margin: 0 0 10px; font-size: 11pt; text-transform: uppercase; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
            .clinical p { font-style: italic; color: #666; min-height: 80px; border: 1px solid #ccc; border-radius: 5px; padding: 10px; }
            .signature { margin-top: 60px; text-align: left; }
            .signature .line { border-top: 1px solid black; width: 200px; padding-top: 5px; }
            .signature .name { font-weight: bold; font-size: 10pt; }
            .signature .role { font-size: 9pt; color: #666; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="bg-slate-800 text-white p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <FileText className="w-5 h-5" />
              Pedido de Anatomopatológico
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={handlePrint} className="text-white hover:bg-white/20">
              <Printer className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
          <div id="biopsy-print-content" className="bg-white p-8 border border-slate-200 shadow-sm rounded-lg text-sm leading-relaxed font-serif text-slate-800">
            
            {/* Header */}
            <div className="header text-center border-b-2 border-black pb-4 mb-6">
              <h1 className="text-xl font-bold uppercase">Pedido de Exame Anatomopatológico</h1>
              <p className="text-sm text-gray-600">Serviço de Endoscopia Digestiva</p>
            </div>

            {/* Info */}
            <div className="info mb-6">
              <p><strong>Paciente:</strong> {paciente || "Paciente Não Identificado"}</p>
              <p><strong>Data:</strong> {data}</p>
              <p><strong>Médico Solicitante:</strong> {doctorName}</p>
            </div>

            {/* Materials */}
            <div className="materials mb-6 p-4 border border-gray-300 rounded bg-gray-50">
              <h3 className="font-bold mb-2 uppercase text-sm border-b border-gray-300 pb-1">Material Enviado</h3>
              <ul className="list-disc pl-5 space-y-2">
                {materials.length > 0 ? materials.map((m, idx) => (
                  <li key={idx}>
                    <strong>{m.local}:</strong> {m.desc}
                  </li>
                )) : (
                  <li className="text-gray-500 italic">
                    Nenhum material específico selecionado automaticamente. Preencher manualmente.
                  </li>
                )}
              </ul>
            </div>

            {/* Clinical Data */}
            <div className="clinical mb-8">
              <h3 className="font-bold mb-2 uppercase text-sm border-b border-gray-300 pb-1">Dados Clínicos / Hipótese Diagnóstica</h3>
              <p className="min-h-[80px] border border-gray-300 rounded p-2 text-gray-600 italic">
                Achados endoscópicos sugestivos de patologia descrita. Vide laudo anexo.
              </p>
            </div>

            {/* Signature */}
            <div className="signature mt-12">
              <div className="line border-t border-black w-48 pt-1">
                <p className="name text-xs font-bold mt-1">{doctorName}</p>
                <p className="role text-[10px] text-gray-500">Médico Endoscopista</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="bg-white p-4 border-t border-slate-200 flex-shrink-0">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handlePrint} className="bg-sky-600 hover:bg-sky-500">
            <Printer className="w-4 h-4 mr-2" />
            Imprimir Pedido
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}