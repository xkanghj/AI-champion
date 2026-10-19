// 심사 규칙: 한도액 = 인구수 × 10, 신청액 > 한도액 → 반려, 그 외 → 승인
// 같은 폴더의 JSON을 먼저 읽고, 없으면 GitHub 원본을 읽는다
const DATA_SOURCES = [
  "신청목록.json",
  "https://raw.githubusercontent.com/xkanghj/ai-champion/main/budget-review/%EC%8B%A0%EC%B2%AD%EB%AA%A9%EB%A1%9D.json",
];
const fmt = (n) => n.toLocaleString("ko-KR");

function judge(item) {
  const limit = item["인구수"] * 10;
  const result = item["신청액"] > limit ? "반려" : "승인";
  return { ...item, 한도액: limit, 판정: result };
}

function render(rows) {
  const tbody = document.getElementById("tbody");
  tbody.innerHTML = rows
    .map((r) => {
      const ok = r.판정 === "승인";
      return `<tr class="${ok ? "" : "rejected"}">
        <td>${r["지자체명"]}</td>
        <td class="num">${fmt(r["인구수"])}</td>
        <td class="num">${fmt(r["신청액"])}</td>
        <td class="num">${fmt(r.한도액)}</td>
        <td class="center"><span class="badge ${ok ? "ok" : "no"}">${r.판정}</span></td>
      </tr>`;
    })
    .join("");

  const approved = rows.filter((r) => r.판정 === "승인");
  const approvedSum = approved.reduce((s, r) => s + r["신청액"], 0);
  document.getElementById("approvedCount").textContent = `${approved.length}건`;
  document.getElementById("rejectedCount").textContent = `${rows.length - approved.length}건`;
  document.getElementById("approvedSum").textContent = `${fmt(approvedSum)}원`;
  document.getElementById("status").textContent = `총 ${rows.length}건 심사 완료`;
}

async function load() {
  let lastError;
  for (const src of DATA_SOURCES) {
    try {
      const res = await fetch(src.startsWith("http") ? src : encodeURI(src));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      render(data.map(judge));
      return;
    } catch (err) {
      lastError = err;
    }
  }
  document.getElementById("tbody").innerHTML =
    `<tr><td colspan="5" class="center no">신청목록.json을 불러오지 못했습니다 (${lastError.message})</td></tr>`;
}

document.addEventListener("DOMContentLoaded", load);
