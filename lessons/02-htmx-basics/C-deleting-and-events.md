---
title: "hx-delete and events"
description: "Lets delete some contacts"
---

### Break time?

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


### Deleting and Events
before we do anything, we need a good icon!

<br/>
<br/>

**Behold**
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path fill="none" d="M0 0h24v24H0z"/>
    <path d="M4 2h16a1 1 0 011 1v1a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1zM3 6h18v16a1 1 0 01-1 1H4a1 1 0 01-1-1V6zm3 3v9a1 1 0 002 0v-9a1 1 0 00-2 0zm5 0v9a1 1 0 002 0v-9a1 1 0 00-2 0zm5 0v9a1 1 0 002 0v-9a1 1 0 00-2 0z"/>
</svg>

<br/>
<br/>

Code

```html
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path fill="none" d="M0 0h24v24H0z"/>
    <path d="M4 2h16a1 1 0 011 1v1a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1zM3 6h18v16a1 1 0 01-1 1H4a1 1 0 01-1-1V6zm3 3v9a1 1 0 002 0v-9a1 1 0 00-2 0zm5 0v9a1 1 0 002 0v-9a1 1 0 00-2 0zm5 0v9a1 1 0 002 0v-9a1 1 0 00-2 0z"/>
</svg>
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

### Lets Delete!
another nice part of htmx is that we can use _ackshual_ verbs of HTTP to
delete.  This means no more silly rest endpoints.

* GET /contents/:id
* POST /contents
* POST /contents/delete/:id
* POST /contents/update/:id

instead we can just use verbs

* GET /contents/:id
* POST /contents
* DELETE /contents/:id
* PUT|PATCH /contents/:id

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

### Lets update our html
lets add the delete icon next to an address to delete it!

* don't forget to wrap the svg in a div and do closest div, then .contact, then
  the fix :)

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

### Complete Code

**cmd/main.go**
```go
package main

import (
	"html/template"
	"io"
	"strconv"

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
	Id    int
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
				Id:    1,
			},
			{
				Name:  "Jane Doe",
				Email: "jain.doe@gmail.com",
				Id:    2,
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

func NewContact(id int, name, email string) Contact {
	return Contact{
		Id:    id,
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
	id := 3

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

		contact := NewContact(id, name, email)
		id++
		data.Contacts = append(data.Contacts, contact)

		formData := NewFormData()
		err := c.Render(200, "contact-form", formData)

		if err != nil {
			return err
		}

		return c.Render(200, "oob-contact", contact)
	})

	e.DELETE("/contacts/:id", func(c echo.Context) error {
		idStr := c.Param("id")
        id, err := strconv.Atoi(idStr)

        if err != nil {
            return c.String(400, "Id must be an integer")
        }

        deleted := false
		for i, contact := range data.Contacts {
			if contact.Id == id {
				data.Contacts = append(data.Contacts[:i], data.Contacts[i+1:]...)
                deleted = true
                break
			}
		}

        if !deleted {
            return c.String(400, "Contact not found")
        }

		return c.NoContent(200)
	})

	e.Logger.Fatal(e.Start(":42069"))
}
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
<div class="contact" style="display: flex;">
    <div hx-delete="/contacts/{{ .Id }}" hx-swap="outerHTML" hx-target="closest .contact" style="cursor: pointer; width: 24px; height: 24px">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path fill="none" d="M0 0h24v24H0z"/>
            <path d="M4 2h16a1 1 0 011 1v1a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1zM3 6h18v16a1 1 0 01-1 1H4a1 1 0 01-1-1V6zm3 3v9a1 1 0 002 0v-9a1 1 0 00-2 0zm5 0v9a1 1 0 002 0v-9a1 1 0 00-2 0zm5 0v9a1 1 0 002 0v-9a1 1 0 00-2 0z"/>
        </svg>
    </div>

    <b>Name:</b> <span>{{ .Name }}</span>
    <b>Email:</b> <span>{{ .Email }}</span>
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

### But this still... doesn't feel interactive
You want more.. i get it

<br/>
<br/>

Lets add a 1 second delay intentionally to the DELETE api and see what it looks
like

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

### Terrible, shambles, creator is a boomer making boomer front ends
we need this to look better...

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

### Well....
we do have options.
1. hx-indicator
2. swap delays

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

### hx-indicator
this allows us to expose an element while waiting for a request

1. upgrade server to have static content
```go
    e.Static("/images", "images")
    e.Static("/css", "css")
```

1. add css to the index
```html
<link rel="stylesheet" href="/css/index.css">
```

1. use this image for the indicator
```html
<img src="/images/bars.svg" alt="loading" style="width: 24px">
```

1. now implement the wrapping div to be our indicator for requests

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

### Now Swap Delay
This is how we can add a nice fading effect

<br/>
<br/>

Also i will not remember the CSS i need because CSS is a google first language
for me

<br/>
<br/>

**update css/index.css**

```css
.contact.htmx-swapping {
    opacity:0;
    transition: opacity 500ms ease-in;
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

### Partial Code Change

**views/index.html**
```html
<head>
    ...
    <link rel="stylesheet" href="/css/index.css">
</head>
```

**views/contacts.html**
```html
    <div hx-indicator="#di-{{ .Id }}" ... hx-swap="outerHTML swap:500ms" ...>
        ...
    </div>

    <div id="di-{{ .Id }}" class="htmx-indicator" style="width: 24px; height: 24px">
        <img src="/images/bars.svg" alt="loading" style="width: 24px; height: 24px">
    </div>
```

**cmd/main.go**
```go
	e.DELETE("/contacts/:id", func(c echo.Context) error {
        ...
        time.Sleep(1 * time.Second)
        ...
    });
```

**css/index.css**
```css

.contact.htmx-swapping {
    opacity:0;
    transition: opacity 500ms ease-in;
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

