const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const sanitizeHtml = require("sanitize-html");
const template = require("../lib/template");
const auth = require("../lib/auth");

router.get("/create", (request, response) => {
  if (!auth.isOwner(request, response)) {
    response.redirect("/");
    return false;
  }
  const title = "WEB - create";
  const list = template.list(request.list);
  const html = template.HTML(
    title,
    list,
    `
        <form action="/topic/create_process" method="post">
          <p><input type="text" name="title" placeholder="title"></p>
          <p>
            <textarea name="description" placeholder="description"></textarea>
          </p>
          <p>
            <input type="submit">
          </p>
        </form>
      `,
    "",
    auth.statusUI(request, response)
  );
  response.send(html);
});

router.post("/delete_process", (request, response) => {
  if (!auth.isOwner(request, response)) {
    response.redirect("/");
    return false;
  }
  const post = request.body;
  const id = post.id;
  const filteredId = path.parse(id).base;
  fs.unlink(`data/${filteredId}`, error => {
    response.redirect("/");
  });
});

router.get("/update/:pageId", (request, response) => {
  if (!auth.isOwner(request, response)) {
    response.redirect("/");
    return false;
  }
  const filteredId = path.parse(request.params.pageId).base;
  fs.readFile(`data/${filteredId}`, "utf8", (err, description) => {
    const title = request.params.pageId;
    const list = template.list(request.list);
    const html = template.HTML(
      title,
      list,
      `
          <form action="/topic/update_process" method="post">
            <input type="hidden" name="id" value="${title}">
            <p><input type="text" name="title" placeholder="title" value="${title}"></p>
            <p>
              <textarea name="description" placeholder="description">${description}</textarea>
            </p>
            <p>
              <input type="submit">
            </p>
          </form>
          `,
      `<a href="/topic/create">create</a> <a href="/update?id=${title}">update</a>`,
      auth.statusUI(request, response)
    );
    response.send(html);
  });
});

router.post("/update_process", (request, response) => {
  if (!auth.isOwner(request, response)) {
    response.redirect("/");
    return false;
  }
  const post = request.body;
  const id = post.id;
  const title = post.title;
  const description = post.description;
  fs.rename(`data/${id}`, `data/${title}`, error => {
    fs.writeFile(`data/${title}`, description, "utf8", err => {
      response.redirect(`/topic/${title}`);
    });
  });
});

router.post("/create_process", (request, response) => {
  if (!auth.isOwner(request, response)) {
    response.redirect("/");
    return false;
  }
  const post = request.body;
  const title = post.title;
  const description = post.description;
  fs.writeFile(`data/${title}`, description, "utf8", err => {
    response.redirect(`/topic/${title}`);
  });
});

router.get("/:pageId", (request, response, next) => {
  const filteredId = path.parse(request.params.pageId).base;
  fs.readFile(`data/${filteredId}`, "utf8", (err, description) => {
    if (err) {
      next(err);
    } else {
      const title = request.params.pageId;
      const sanitizedTitle = sanitizeHtml(title);
      const sanitizedDescription = sanitizeHtml(description, {
        allowedTags: ["h1"]
      });
      const list = template.list(request.list);
      const html = template.HTML(
        sanitizedTitle,
        list,
        `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
        ` <a href="/topic/create">create</a>
              <a href="/topic/update/${sanitizedTitle}">update</a>
              <form action="/topic/delete_process" method="post">
                <input type="hidden" name="id" value="${sanitizedTitle}">
                <input type="submit" value="delete">
              </form>`,
        auth.statusUI(request, response)
      );
      response.send(html);
    }
  });
});

module.exports = router;
