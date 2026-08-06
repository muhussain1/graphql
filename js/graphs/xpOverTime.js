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

function shortXP(value) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} MB`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)} kB`;
  return `${Math.round(value)} B`;
}

export function drawXpOverTime(svg, transactions) {
  svg.replaceChildren();

  const title = createSvgElement("title", { id: "xp-chart-title" }, "Cumulative XP over time");
  const description = createSvgElement(
    "desc",
    { id: "xp-chart-description" },
    "A line chart showing how total earned XP increased over time."
  );
  svg.append(title, description);

  if (!transactions.length) {
    svg.append(createSvgElement("text", { x: 380, y: 150, "text-anchor": "middle", class: "chart-label" }, "No XP data yet"));
    return;
  }

  const width = 760;
  const height = 300;
  const padding = { top: 24, right: 24, bottom: 42, left: 64 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  let runningTotal = 0;
  const points = transactions.map((transaction) => {
    runningTotal += Number(transaction.amount) || 0;
    return { total: runningTotal, date: new Date(transaction.createdAt) };
  });
  const maximum = Math.max(runningTotal, 1);

  const coordinates = points.map((point, index) => {
    const x = points.length === 1
      ? padding.left + chartWidth / 2
      : padding.left + (index / (points.length - 1)) * chartWidth;
    const y = padding.top + chartHeight - (point.total / maximum) * chartHeight;
    return { x, y };
  });

  svg.append(
    createSvgElement("line", {
      x1: padding.left,
      y1: padding.top + chartHeight,
      x2: width - padding.right,
      y2: padding.top + chartHeight,
      class: "chart-axis",
    }),
    createSvgElement("line", {
      x1: padding.left,
      y1: padding.top,
      x2: padding.left,
      y2: padding.top + chartHeight,
      class: "chart-axis",
    })
  );

  const linePoints = coordinates.map(({ x, y }) => `${x},${y}`).join(" ");
  const areaPoints = `${padding.left},${padding.top + chartHeight} ${linePoints} ${width - padding.right},${padding.top + chartHeight}`;
  svg.append(
    createSvgElement("polygon", { points: areaPoints, class: "chart-area" }),
    createSvgElement("polyline", { points: linePoints, class: "chart-line" })
  );

  coordinates.forEach(({ x, y }) => {
    svg.append(createSvgElement("circle", { cx: x, cy: y, r: 4, class: "chart-point" }));
  });

  const firstDate = points[0].date.toLocaleDateString(undefined, { month: "short", year: "numeric" });
  const lastDate = points.at(-1).date.toLocaleDateString(undefined, { month: "short", year: "numeric" });
  svg.append(
    createSvgElement("text", { x: padding.left, y: height - 12, class: "chart-label" }, firstDate),
    createSvgElement("text", { x: width - padding.right, y: height - 12, "text-anchor": "end", class: "chart-label" }, lastDate),
    createSvgElement("text", { x: padding.left - 10, y: padding.top + 5, "text-anchor": "end", class: "chart-label" }, shortXP(maximum)),
    createSvgElement("text", { x: padding.left - 10, y: padding.top + chartHeight, "text-anchor": "end", class: "chart-label" }, "0")
  );
}
