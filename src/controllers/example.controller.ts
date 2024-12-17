import Elysia, { t } from "elysia"

export const example = new Elysia()

  .get("/", () => "Sui!!!", {
    detail: {
      tags: ["Example"],
      summary: ('Get Hello TJ'),
      Description: 'Hello'
    }
  })

  .get("/home", () => "Wowww", {})

  .post("/about", ({ body }) => {
    return {
      id: '159357',
      msg: 'sui' + body.name
    }
  }, {
    body: t.Object({
      name: t.String()
    }),
    detail: {
      tags: ["Example"],
      summary: ('About'),
      Description: 'Hello I love Roblox'
    }
  })