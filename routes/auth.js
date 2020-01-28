const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const sanitizeHtml = require("sanitize-html");
const template = require("../lib/template");

const authData = {
  email: "egoing777@gmail.com",
  password: "111111",
  nickname: "egoing"
};

router.get("/login", (request, response) => {
  const title = "WEB - login";
  const list = template.list(request.list);
  const html = template.HTML(
    title,
    list,
    `
        <form action="/auth/login_process" method="post">
          <p><input type="text" name="email" placeholder="email"></p>
          <p><input type="password" name="pwd" placeholder="password"></p>
          <p>
            <input type="submit" value="login">
          </p>
        </form>
      `,
    ""
  );
  response.send(html);
});

router.post("/login_process", (request, response) => {
  const post = request.body;
  const email = post.email;
  const pwd = post.pwd;
  if (email === authData.email && pwd === authData.password) {
    request.session.is_logined = true;
    request.session.nickname = authData.nickname;
    response.redirect(`/`);
  } else {
    response.send("Who?");
  }
});

/* router.get("/create", (request, response) => {
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
    ""
  );
  response.send(html);
});

router.post("/delete_process", (request, response) => {
  const post = request.body;
  const id = post.id;
  const filteredId = path.parse(id).base;
  fs.unlink(`data/${filteredId}`, error => {
    response.redirect("/");
  });
});

router.get("/update/:pageId", (request, response) => {
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
      `<a href="/topic/create">create</a> <a href="/update?id=${title}">update</a>`
    );
    response.send(html);
  });
});

router.post("/update_process", (request, response) => {
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
              </form>`
      );
      response.send(html);
    }
  });
}); */

module.exports = router;
