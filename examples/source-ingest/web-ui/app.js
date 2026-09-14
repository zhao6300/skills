const form = document.querySelector("#search-form");
const filter = document.querySelector("#filter");
const records = document.querySelector("#records");
const queryInput = document.querySelector("#query");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  search(queryInput.value.trim());
});

async function search(query) {
  if (!query) {
    updateRecords(null, [{ message: "A non-empty query is required." }]);
    return;
  }

  updateRecords(query, null);
  const response = await fetch(`/api/sources?query=${encodeURIComponent(query)}`);
  if (!response.ok) {
    updateRecords(query, [{ message: "Source search failed." }]);
    return;
  }
  updateRecords(query, null, (await response.json()).records);
}

function updateRecords(query, errors, results = []) {
  const recordNode = document.querySelector("#records");
  recordNode.textContent = "";

  if (errors?.length) {
    recordNode.append(...errors.map((error) => {
      const node = document.createElement("p");
      node.textContent = error.message;
      return node;
    }));
    return;
  }

  const filtered = results.filter((record) => filter.value === "all" || record.source_type === filter.value);
  if (!filtered.length) {
    recordNode.append("No records found.");
    return;
  }

  recordNode.append(`${filtered.length} records returned for “${query}”.`);
  recordNode.append(createElement("ol", null, filtered.map((record) => createRecord(record))));
}

function createElement(name, text, children = []) {
  const node = document.createElement(name);
  if (text) {
    node.append(document.createTextNode(text));
  }
  if (children.length) {
    node.append(...children);
  }
  return node;
}

function createRecord(record) {
  const title = createElement("h2");
  const link = document.createElement("a");

  if (record.url) {
    link.href = record.url;
    link.textContent = record.title;
    title.append(link);
  } else {
    title.textContent = record.title;
  }

  const meta = createElement("dl");
  for (const field of ["source", "source_type", "published_at", "license"]) {
    meta.append(createElement("dt", field));
    meta.append(createElement("dd", stringFrom(record[field])));
  }

  const article = createElement("article", null, [
    title,
    record.summary ? createElement("p", record.summary) : null,
    record.authors?.length ? createElement("p", `Authors: ${record.authors.join(", ")}`) : null,
    record.topics?.length ? createElement("p", `Topics: ${record.topics.join(", ")}`) : null,
    meta,
  ].filter(Boolean));
  article.className = "record";

  return createElement("li", null, [article]);
}

function stringFrom(value) {
  if (value === null || value === undefined || value === "") {
    return "Not provided";
  }

  const text = String(value);
  return text.length > 64 ? `${text.slice(0, 64)}…` : text;
}
