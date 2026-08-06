const SVG_NS = "http://www.w3.org/2000/svg";

function createSvgElement(name, attributes = {}, text = "") {
  const element = document.createElementNS(SVG_NS, name);

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });

  if (text) {
    element.textContent = text;
  }

  return element;
}

function formatAmount(value) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} MB`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)} kB`;
  return `${Math.round(value)} B`;
}

export function drawAuditRatio(svg, up, down) {
  svg.replaceChildren();

  const total = up + down;
  const ratio = down > 0 ? up / down : 0;
  const radius = 82;
  const circumference = 2 * Math.PI * radius;
  const upShare = total > 0 ? up / total : 0;

  svg.append(
    createSvgElement("title", { id: "audit-chart-title" }, "Audit contribution ratio"),
    createSvgElement(
      "desc",
      { id: "audit-chart-description" },
      `A donut chart comparing ${formatAmount(up)} given to ${formatAmount(down)} received.`
    )
  );

  const centerX = 210;
  const centerY = 130;
  const baseCircle = createSvgElement("circle", {
    cx: centerX,
    cy: centerY,
    r: radius,
    fill: "none",
    stroke: "#e7ebf2",
    "stroke-width": 24,
  });
  const upCircle = createSvgElement("circle", {
    cx: centerX,
    cy: centerY,
    r: radius,
    fill: "none",
    stroke: "#21a179",
    "stroke-width": 24,
    "stroke-linecap": "round",
    "stroke-dasharray": `${circumference * upShare} ${circumference}`,
    transform: `rotate(-90 ${centerX} ${centerY})`,
  });

  svg.append(baseCircle);
  if (total > 0) svg.append(upCircle);

  svg.append(
    createSvgElement("text", { x: centerX, y: centerY - 2, "text-anchor": "middle", class: "chart-value" }, total ? ratio.toFixed(1) : "—"),
    createSvgElement("text", { x: centerX, y: centerY + 22, "text-anchor": "middle", class: "chart-label" }, "ratio"),
    createSvgElement("circle", { cx: 92, cy: 264, r: 6, fill: "#21a179" }),
    createSvgElement("text", { x: 106, y: 268, class: "chart-label" }, `Given ${formatAmount(up)}`),
    createSvgElement("circle", { cx: 250, cy: 264, r: 6, fill: "#dfe5ee" }),
    createSvgElement("text", { x: 264, y: 268, class: "chart-label" }, `Received ${formatAmount(down)}`)
  );
}
