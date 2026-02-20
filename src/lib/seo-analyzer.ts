export interface SEOAnalysis {
  score: number;
  checks: {
    id: string;
    label: string;
    passed: boolean;
    importance: "high" | "medium" | "low";
  }[];
}

export function analyzeSEO(title: string, content: string, description: string, keyword: string): SEOAnalysis {
  const checks = [];
  let score = 0;

  // 1. Keyword in Title (High)
  const keywordInTitle = title.toLowerCase().includes(keyword.toLowerCase()) && keyword.length > 0;
  checks.push({
    id: "kw-title",
    label: "Mot-clé dans le titre",
    passed: keywordInTitle,
    importance: "high" as const,
  });
  if (keywordInTitle) score += 25;

  // 2. Meta Description Length (Medium)
  const descLength = description.length;
  const descPassed = descLength >= 120 && descLength <= 160;
  checks.push({
    id: "desc-length",
    label: "Description (120-160 car.)",
    passed: descPassed,
    importance: "medium" as const,
  });
  if (descPassed) score += 15;

  // 3. Keyword in First Paragraph (High)
  const firstParagraph = content.split(/<\/p>/)[0] || "";
  const kwInFirstPara = firstParagraph.toLowerCase().includes(keyword.toLowerCase()) && keyword.length > 0;
  checks.push({
    id: "kw-para",
    label: "Mot-clé dans le 1er paragraphe",
    passed: kwInFirstPara,
    importance: "high" as const,
  });
  if (kwInFirstPara) score += 20;

  // 4. Use of H2/H3 (Medium)
  const hasH2 = /<h2/.test(content);
  const hasH3 = /<h3/.test(content);
  checks.push({
    id: "headers",
    label: "Utilisation de H2 ou H3",
    passed: hasH2 || hasH3,
    importance: "medium" as const,
  });
  if (hasH2 || hasH3) score += 15;

  // 5. Internal & External Links (Medium)
  const hasInternalLink = content.includes('href="/"') || content.includes('href="/blog') || content.includes('href="https://jootiya.com');
  const hasExternalLink = /href="https?:\/\/(?!jootiya\.com)/.test(content);
  
  checks.push({
    id: "int-link",
    label: "Lien interne",
    passed: hasInternalLink,
    importance: "low" as const,
  });
  checks.push({
    id: "ext-link",
    label: "Lien externe",
    passed: hasExternalLink,
    importance: "low" as const,
  });
  
  if (hasInternalLink) score += 10;
  if (hasExternalLink) score += 15;

  return {
    score: Math.min(score, 100),
    checks,
  };
}
