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

function niceMaximum(value) {
  if (value <= 0) return 1;

  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = magnitude / 2;
  return Math.ceil(value / step) * step;
}

function formatDate(date) {
  return date.toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
  });
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
    svg.append(
      createSvgElement(
        "text",
        { x: 380, y: 150, "text-anchor": "middle", class: "chart-label" },
        "No XP data yet"
      )
    );
    return;
  }

  const width = 760;
  const height = 300;
  const padding = { top: 24, right: 28, bottom: 42, left: 70 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  let runningTotal = 0;
  const points = transactions.map((transaction) => {
    runningTotal += Number(transaction.amount) || 0;
    return { total: runningTotal, date: new Date(transaction.createdAt) };
  });
  const maximum = niceMaximum(runningTotal);
  const firstTime = points[0].date.getTime();
  const lastTime = points.at(-1).date.getTime();
  const timeRange = Math.max(lastTime - firstTime, 1);

  const coordinates = points.map((point) => {
    const x = points.length === 1
      ? padding.left + chartWidth
      : padding.left + ((point.date.getTime() - firstTime) / timeRange) * chartWidth;
    const y = padding.top + chartHeight - (point.total / maximum) * chartHeight;
    return { x, y };
  });

  const gradient = createSvgElement("linearGradient", {
    id: "xp-area-gradient",
    x1: "0",
    y1: "0",
    x2: "0",
    y2: "1",
  });
  gradient.append(
    createSvgElement("stop", { offset: "0%", class: "chart-gradient-start" }),
    createSvgElement("stop", { offset: "100%", class: "chart-gradient-end" })
  );
  const defs = createSvgElement("defs");
  defs.append(gradient);
  svg.append(defs);

  [0, 0.5, 1].forEach((fraction) => {
    const y = padding.top + chartHeight - chartHeight * fraction;
    svg.append(
      createSvgElement("line", {
        x1: padding.left,
        y1: y,
        x2: width - padding.right,
        y2: y,
        class: "chart-grid-line",
      }),
      createSvgElement(
        "text",
        {
          x: padding.left - 12,
          y: y + 4,
          "text-anchor": "end",
          class: "chart-label",
        },
        shortXP(maximum * fraction)
      )
    );
  });

  const linePath = coordinates
    .map(({ x, y }, index) => `${index === 0 ? "M" : "L"} ${x} ${y}`)
    .join(" ");
  const baseline = padding.top + chartHeight;
  const areaPath = `${linePath} L ${coordinates.at(-1).x} ${baseline} L ${coordinates[0].x} ${baseline} Z`;
  svg.append(
    createSvgElement("path", { d: areaPath, class: "chart-area" }),
    createSvgElement("path", { d: linePath, class: "chart-line" })
  );

  const latest = coordinates.at(-1);
  svg.append(
    createSvgElement("line", {
      x1: latest.x,
      y1: latest.y,
      x2: latest.x,
      y2: baseline,
      class: "chart-guide",
    }),
    createSvgElement("circle", { cx: latest.x, cy: latest.y, r: 8, class: "chart-point-halo" }),
    createSvgElement("circle", { cx: latest.x, cy: latest.y, r: 4, class: "chart-point" })
  );

  const middleDate = new Date(firstTime + timeRange / 2);
  const dateLabels = [
    { date: points[0].date, x: padding.left, anchor: "start" },
    { date: middleDate, x: padding.left + chartWidth / 2, anchor: "middle" },
    { date: points.at(-1).date, x: width - padding.right, anchor: "end" },
  ];

  dateLabels.forEach(({ date, x, anchor }) => {
    svg.append(
      createSvgElement(
        "text",
        { x, y: height - 12, "text-anchor": anchor, class: "chart-label chart-date" },
        formatDate(date)
      )
    );
  });
}
