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
  const maximum = Math.max(up, down, 1);

  svg.append(
    createSvgElement("title", { id: "audit-chart-title" }, "Audit contribution ratio"),
    createSvgElement(
      "desc",
      { id: "audit-chart-description" },
      `Two bars comparing ${formatAmount(up)} given to ${formatAmount(down)} received.`
    )
  );

  svg.append(
    createSvgElement("text", { x: 36, y: 58, class: "audit-ratio-value" }, total ? ratio.toFixed(1) : "—"),
    createSvgElement("text", { x: 36, y: 82, class: "chart-label" }, "current ratio")
  );

  const bars = [
    { label: "Given", amount: up, y: 132, className: "audit-bar-given" },
    { label: "Received", amount: down, y: 214, className: "audit-bar-received" },
  ];

  bars.forEach(({ label, amount, y, className }) => {
    const barWidth = total > 0 ? (amount / maximum) * 348 : 0;
    svg.append(
      createSvgElement("text", { x: 36, y: y - 16, class: "audit-bar-label" }, label),
      createSvgElement(
        "text",
        { x: 384, y: y - 16, "text-anchor": "end", class: "chart-label" },
        formatAmount(amount)
      ),
      createSvgElement("rect", { x: 36, y, width: 348, height: 16, rx: 8, class: "audit-bar-track" }),
      createSvgElement("rect", { x: 36, y, width: barWidth, height: 16, rx: 8, class: className })
    );
  });
}
