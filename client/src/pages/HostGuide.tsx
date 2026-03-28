import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const PDF_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663228681359/mkW6ExSEHJcqGWsa6M4fqn/host-guide-mar2026_b0202bc4.pdf";

const PAGES = [
  {
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663228681359/mkW6ExSEHJcqGWsa6M4fqn/host-guide-page-1_07a7d774.png",
    alt: "Host Guide Page 1",
  },
  {
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663228681359/mkW6ExSEHJcqGWsa6M4fqn/host-guide-page-2_06a5d5ff.png",
    alt: "Host Guide Page 2",
  },
  {
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663228681359/mkW6ExSEHJcqGWsa6M4fqn/host-guide-page-3_74cbcf95.png",
    alt: "Host Guide Page 3",
  },
];

export default function HostGuide() {
  return (
    <div className="min-h-screen bg-[#111] text-white flex flex-col">
      {/* Header */}
      <div className="border-b border-white/10 px-4 py-4 flex items-center justify-between gap-4 sticky top-0 bg-[#111] z-10">
        <div className="min-w-0">
          <p className="text-xs tracking-[0.2em] uppercase text-[#c9a96e] font-medium mb-0.5">
            +1 Chopsticks
          </p>
          <h1 className="text-base font-semibold text-white leading-tight">
            Host Guide — March 2026
          </h1>
        </div>
        <a
          href={PDF_URL}
          download="+1Chopsticks_Host_Guide_Mar2026.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0"
        >
          <Button
            variant="outline"
            size="sm"
            className="border-[#c9a96e] text-[#c9a96e] hover:bg-[#c9a96e] hover:text-black gap-2 bg-transparent"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download PDF</span>
          </Button>
        </a>
      </div>

      {/* Pages — rendered as images, works on all devices */}
      <div className="flex flex-col items-center gap-1 py-6 px-2">
        {PAGES.map((page, i) => (
          <img
            key={i}
            src={page.url}
            alt={page.alt}
            className="w-full max-w-3xl shadow-2xl"
            style={{ display: "block" }}
            loading={i === 0 ? "eager" : "lazy"}
          />
        ))}
      </div>

      {/* Bottom download CTA */}
      <div className="flex justify-center py-8 border-t border-white/10">
        <a
          href={PDF_URL}
          download="+1Chopsticks_Host_Guide_Mar2026.pdf"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button className="bg-[#c9a96e] text-black hover:bg-[#b8954f] gap-2 px-6">
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
        </a>
      </div>
    </div>
  );
}
