import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const PDF_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663228681359/mkW6ExSEHJcqGWsa6M4fqn/host-guide-mar2026_b0202bc4.pdf";

export default function HostGuide() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* Header */}
      <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs tracking-[0.2em] uppercase text-[#c9a96e] font-medium mb-0.5">
            +1 Chopsticks
          </p>
          <h1 className="text-lg font-semibold text-white leading-tight">
            Host Guide — March 2026
          </h1>
        </div>
        <a href={PDF_URL} download="1Chopsticks_Host_Guide_Mar2026.pdf" target="_blank" rel="noopener noreferrer">
          <Button
            variant="outline"
            size="sm"
            className="border-[#c9a96e] text-[#c9a96e] hover:bg-[#c9a96e] hover:text-black gap-2 bg-transparent"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
        </a>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 w-full">
        <iframe
          src={`${PDF_URL}#toolbar=1&navpanes=0&scrollbar=1`}
          className="w-full h-full"
          style={{ minHeight: "calc(100vh - 73px)", border: "none" }}
          title="+1 Chopsticks Host Guide"
        />
      </div>
    </div>
  );
}
