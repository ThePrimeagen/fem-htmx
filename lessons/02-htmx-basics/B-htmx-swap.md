---
title: "HTMX Status Codes, Events, And Swaps"
description: "going deep on hx-swap, oob, and status codes"
---

### This is great... but... not really
I hear you.  This is not very interactive is it?  We will get there, hold up

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

* you can literally use react with htmx
* you can use web components, lit components, whatever
* you can even raw dawg some js and css in there if needed

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

### Lets build a small application
a simple "contacts" application

Lets create a simple application that has a form that takes in name and email
and "saves" it

* first lets create a form that takes a name and email
* every time we hit "save" it will add the name and email to the server
  (just in memory) and display the updated list of names and emails

<br/>
<br/>

**Why No sqlite?**
don't you love [turso](https://turso.tech/deeznuts)???

<br/>
* every time we refresh our server, we lose our data

<br/>
<br/>

**First The HTML** then we will do the server part
* build a form with name and email and submit button
* build a display list of name and emails (contacts)

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


### Full Programmed HTML Engineering

**views/index.html**
```html
<html>
    <head>
        <title>Our First HTML Site!</title>
        <script src="https://unpkg.com/htmx.org/dist/htmx.min.js"></script>
    </head>
    <body>
        {{ template "form" . }}
        <hr />
        {{ template "display" . }}
    </body>
</html>

{{ block "form" . }}
<form hx-post="/contacts">
    <label for="name">Name</label>
    <input name="name" placeholder="Name">

    <label for="email">Email</label>
    <input type="email" name="email" placeholder="Email">

    <button type="submit">Submit</button>
</form>
{{ end }}

{{ block "display" . }}
    {{ range .Contacts }}
        <div>
            Name: <span>{{ .Name }}</span>
            Email: <span>{{ .Email }}</span>
        </div>
    {{ end }}
{{ end }}
```

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

### Now lets upgrade the server
* index.html now requires an object with { .Contacts } on it
* we need an endpoint `/contacts` that takes `POST` requests

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

### All the code

```go
package main

import (
	"html/template"
	"io"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

type Template struct {
	tmpl *template.Template
}

func newTemplate() *Template {
	return &Template{
		tmpl: template.Must(template.ParseGlob("views/*.html")),
	}
}

func (t *Template) Render(w io.Writer, name string, data interface{}, c echo.Context) error {
	return t.tmpl.ExecuteTemplate(w, name, data)
}

type Contact struct {
	Name  string
	Email string
}

type Data struct {
	Contacts []Contact
}

func NewData() *Data {
	return &Data{
		Contacts: []Contact{},
	}
}

func NewContact(name, email string) Contact {
    return Contact{
        Name: name,
        Email: email,
    }
}

func main() {

	e := echo.New()

	data := NewData()

	e.Renderer = newTemplate()
	e.Use(middleware.Logger())

	e.GET("/", func(c echo.Context) error {
		return c.Render(200, "index.html", data)
	})

	e.POST("/contacts", func(c echo.Context) error {
		name := c.FormValue("name")
		email := c.FormValue("email")

		data.Contacts = append(data.Contacts, NewContact(name, email))

		return c.Render(200, "index.html", data)
	})

	e.Logger.Fatal(e.Start(":42069"))
}
```

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

### What went wrong?
![Name And Email Display Issues](./images/name-email-oops.png)

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

### Lets fix this
this is the same problem as before.  we are returning the whole html fragment
but replacing the `form` with that value (the `body` value)

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

### But is this good?
What are the problems with this approach?

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

### Lets explore the space a bit
There is more to offer with htmx...  lets give it a go
* what if we only responded with contacts?

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

### What's wrong with this approach?
* there are two big problems here...

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

### what about errors?
One option is to use response headers: [Response Headers](https://htmx.org/reference/#response_headers)

<br/>
<br/>

Another option: invert how we are doing this and use out of band updates

<br/>
<br/>

* lets make that change to return a `400` when there is a duplicate email and
  add error displays / maintaining values from server for the form

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

### Why are we not rendering?
1. we have hit default behavior of htmx. [Default Behavior of 4xx and 5xx](https://htmx.org/docs/#modifying_swapping_behavior_with_events)
1. is 400 the right status code?

<br/>
<br/>

### What we need to do
1. lets change from 400 -> 422, respond with some extra headers
1. lets add this bit of JS to our index

```javascript
document.addEventListener("DOMContentLoaded", (event) => {
    document.body.addEventListener('htmx:beforeSwap', function(evt) {
        if (evt.detail.xhr.status === 422) {
            // allow 422 responses to swap as we are using this as a signal that
            // a form was submitted with bad data and want to rerender with the
            // errors
            //
            // set isError to false to avoid error logging in console
            evt.detail.shouldSwap = true;
            evt.detail.isError = false;
        }
    });
})
```

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

### Ok, we can render errors, what about success?
Lets tackle this with out of band updates

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


### But we are STILL not right...
How do we clear out the form... Or the under girding question, how do we update
2 places at once?

<br/>
<br/>

**OOB Updates**
An Out Of Band Update (OOB) is a swap that happens outside the normal flow

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

**cmd/main.go**
```go
package main

import (
	"html/template"
	"io"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

type Template struct {
	tmpl *template.Template
}

func newTemplate() *Template {
	return &Template{
		tmpl: template.Must(template.ParseGlob("views/*.html")),
	}
}

func (t *Template) Render(w io.Writer, name string, data interface{}, c echo.Context) error {
	return t.tmpl.ExecuteTemplate(w, name, data)
}

type Contact struct {
	Name  string
	Email string
}

type Data struct {
	Contacts []Contact
}

func NewData() *Data {
	return &Data{
		Contacts: []Contact{
			{
				Name:  "John Doe",
				Email: "john.doe@gmail.com",
			},
			{
				Name:  "Jane Doe",
				Email: "jain.doe@gmail.com",
			},
		},
	}
}

type FormData struct {
	Errors map[string]string
	Values map[string]string
}

func NewFormData() FormData {
	return FormData{
		Errors: map[string]string{},
		Values: map[string]string{},
	}
}

type PageData struct {
	Data Data
	Form FormData
}

func NewContact(name, email string) Contact {
	return Contact{
		Name:  name,
		Email: email,
	}
}

func NewPageData(data Data, form FormData) PageData {
	return PageData{
		Data: data,
		Form: form,
	}
}

func contactExists(contacts []Contact, email string) bool {
	for _, c := range contacts {
		if c.Email == email {
			return true
		}
	}
	return false
}

func main() {

	e := echo.New()

	data := NewData()

	e.Renderer = newTemplate()
	e.Use(middleware.Logger())

	e.GET("/", func(c echo.Context) error {
		return c.Render(200, "index.html", NewPageData(*data, NewFormData()))
	})

	e.POST("/contacts", func(c echo.Context) error {
		name := c.FormValue("name")
		email := c.FormValue("email")

		if contactExists(data.Contacts, email) {
			formData := FormData{
				Errors: map[string]string{
					"email": "Email already exists",
				},
				Values: map[string]string{
					"name":  name,
					"email": email,
				},
			}

			return c.Render(422, "contact-form", formData)
		}

		contact := NewContact(name, email)
		data.Contacts = append(data.Contacts, contact)

		formData := NewFormData()
		err := c.Render(200, "contact-form", formData)

		if err != nil {
			return err
		}

		return c.Render(200, "oob-contact", contact)
	})

	e.Logger.Fatal(e.Start(":42069"))
}
```

**views/index.html**
```html
<html>
    <head>
        <title>Our First HTML Site!</title>
        <script src="https://unpkg.com/htmx.org/dist/htmx.js"></script>
    </head>
    <body>
        {{ template "contact-form" .Form }}
        <hr />
        {{ template "display" .Data }}

<script type="text/javascript">
        document.addEventListener("DOMContentLoaded", (event) => {
document.body.addEventListener('htmx:beforeSwap', function(evt) {
    if (evt.detail.xhr.status === 422) {
            console.log("setting status to paint");
        // allow 422 responses to swap as we are using this as a signal that
        // a form was submitted with bad data and want to rerender with the
        // errors
        //
        // set isError to false to avoid error logging in console
        evt.detail.shouldSwap = true;
        evt.detail.isError = false;
    }
});
        });
</script>
    </body>
</html>
```

**views/contacts.html**
```html
{{ block "contact-form" . }}
<form id="contact-form" hx-post="/contacts" hx-swap="outerHTML">
    <label for="name">Name</label>
    <input name="name"
        {{ if .Values }}
            {{ if .Values.name }}
                value="{{ .Values.name }}"
            {{ end }}
        {{ end }}
        placeholder="Name">

        {{ if (.Errors) }}
            {{ if (.Errors.name) }}
                <div class="error">{{ .Errors.name }}</div>
            {{ end }}
        {{ end }}

    <label for="email">Email</label>
    <input type="email"
        {{ if (.Values) }}
            {{ if (.Values.email) }}
                value="{{ .Values.email }}"
            {{ end }}
        {{ end }}
        name="email" placeholder="Email">

        {{ if (.Errors) }}
            {{ if (.Errors.email) }}
                <div class="error">{{ .Errors.email }}</div>
            {{ end }}
        {{ end }}

    <button type="submit">Submit</button>
</form>
{{ end }}

{{ block "display" . }}
    <div id="contacts">
    {{ range .Contacts }}
        {{ template "contact" . }}
    {{ end }}
    </div>
{{ end }}


{{ block "contact" . }}
<div>
    Name: <span>{{ .Name }}</span>
    Email: <span>{{ .Email }}</span>
</div>
{{ end }}

{{ block "oob-contact" . }}
<div hx-swap-oob="afterbegin" id="contacts">
    {{ template "contact" . }}
</div>
{{ end }}

{{ block "test" . }}
<div>
__TESTING__
</div>
{{ end }}
```

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

