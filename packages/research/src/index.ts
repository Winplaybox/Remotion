import { ResearchDocument } from "../../../schemas";

export interface ResearchEngine {
  extractFromPdf(pdfPath: string): Promise<ResearchDocument>;
  verifyClaim(claimId: string): Promise<boolean>;
}

export class DefaultResearchEngine implements ResearchEngine {
  async extractFromPdf(pdfPath: string): Promise<ResearchDocument> {
    console.log(`[ResearchEngine] PDF extraction stub for ${pdfPath}`);
    return {
      id: "doc_default",
      title: "Sample Research Paper",
      authors: ["Vaswani et al."],
      publisherOrOrg: "ArXiv",
      pdfFilePath: pdfPath,
      totalPages: 15,
      claims: [],
      license: "Creative Commons",
    };
  }

  async verifyClaim(claimId: string): Promise<boolean> {
    console.log(`[ResearchEngine] Verifying claim: ${claimId}`);
    return true;
  }
}
