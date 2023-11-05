---
title: "HTMX Delete and Events"
description: "Lets talk about the delete"
---

### What About Deleting?
Lets extend our example to add a row of random data and then lets think about
how we can delete it?

* first lets create a form that takes a name and phone number (no validation)
* every time we hit "save" it will add the name and phone number to the server
  (just in memory) and display the updated list of names and phone numbers

<br/>
<br/>

### Also... remember
this is a throw away application and our goal is to learn htmx... we may cut a
corner or two...

<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>

### No tailwind?
normally i would be more willing to go the distance here... but i want this to
be as much focus on HTMX as possible, not on anything else

<br/>
<br/>

design? we are wearing our backend caps today

<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>

### Full Code

**views/index.templ**
```templ
type Errors map[string]string

type Info struct {
    Name string
    Phone string
}

type FormData struct {
    Errors Errors
    Info Info
}

func NewFormData() FormData {
    return FormData{
        Errors: make(Errors),
        Info: Info{},
    }
}

templ Index() {
    <html>
        <head>
            <title>Our First HTMX Site!</title>
            <script src="https://unpkg.com/htmx.org@1.9.6" integrity="sha384-FhXw7b6AlE/jyjlZH5iHa/tTe9EpJ1Y55RjcgPbjeWMskSxZt1v9qkxLJWNJaGni" crossorigin="anonymous"></script>
        </head>
        <body>
            <div>
                @Form(NewFormData())
            </div>
        </body>
    </html>
}

templ Form(page FormData) {

    <form hx-post="/add" hx-swap="outerHTML">
        <label for="name">Name</label>
        <input autofocus name="name"

        if _, ok := page.Errors["name"]; ok {
            class="border-red-500"
        }

        value={page.Info.Name}

        type="text"/>

        if msg, ok := page.Errors["name"]; ok {
            <span class="text-red-500">{msg}</span>
        }

        <label for="phone">Phone</label>
        <input name="phone"

        if _, ok := page.Errors["phone"]; ok {
            class="border-red-500"
        }

        value={page.Info.Phone}

        type="phone"/>

        if msg, ok := page.Errors["phone"]; ok {
            <span class="text-red-500">{msg}</span>
        }

        <button type="submit">Submit</button>

    </form>
    <div class="border-b-2 border-slate-200" />
}
```

**cmd/main.go**
```go
    e.POST("/add", func(c echo.Context) error {
        page := views.NewFormData()
        name := c.FormValue("name")
        phone := c.FormValue("phone")

        if name == "" {
            page.Errors["name"] = "Name is required"
        }

        if phone == "" {
            page.Errors["phone"] = "Phone is required"
        }

        if !validate_phone(phone) {
            page.Errors["phone"] = "Phone is invalid, please try again"
        }

        if len(page.Errors) == 0 {
            infos = append(infos, views.Info{Name: name, Phone: phone})
        }

        page.Info.Name = name
        page.Info.Phone = phone

        component := views.Form(page)
        return component.Render(context.Background(), c.Response().Writer)
    })
```

