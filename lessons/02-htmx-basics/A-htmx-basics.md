---
title: "HTMX Basics"
description: "The basics of htmx"
---

### Quick Note
We will introduce htmx through a series of changes and potential debugging, so
there are intentional moments where you are suppose to feel confused.

<br/>
<br/>

**I want you actively engaged** in learning.  So try to guess **why** things
are not working or working oddly

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


### Forget you will
forget everything you have learned up until now, unless what you have learned
PHP from 10 years ago, that will probably help you.

* We will use URLs today... i know a bit scary
* We will use HTTP Status Codes...
* We will even use HTTP Verbs, GET, POST, DELETE...
* We will use as little dependencies as possible
  - i want this course about HTMX, not about other techs

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

### Where do we start?
I suppose the beginning would be good

Lets create a very simple http web server + an index page and then upgrade it
to use htmx

```bash
mkdir views
touch views/index.html
vim . # or use whatever text editor that isn't cool
```

<br/>
<br/>

### Side Note
I know templates are not sexy in todays world.  They are simple, and can become
annoying.  Fully agree.  I intentionally chose templates for the reason stated
above, they are simple and require almost no understanding to follow along.
This is an HTMX course, not a "here is a cool templating language and now lets
learn that" course

<br/>
<br/>

If you want a cool templating feature with go that is typesafe, check out
[Templ](https://templ.guide).  Super cool, allows for code like the following
in go!  And the typesafety is great, the auto complete is pretty dang good too.

```go
package views

import "strconv"

templ Index(count int) {
    <html>
        <head>
            <title>Our First HTMX Site!</title>
        </head>
        <body>
            Count {strconv.Itoa(count)}
        </body>
    </html>
}
```

<br/>
<br/>

Ok back to our regularly scheduled programming, simple html site!  First, just
the html required! (views/index.html)

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

### In case I forget how to code in my favorite programming language: html
`views/index.html`

```html
<html>
    <head>
        <title>Our First HTML Site!</title>
    </head>
    <body>
        Count {{ .Count }}
    </body>
</html>
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

### Setup a quick server
We will use echo... I know shut up, everyone has their favorite server, this
one is just simple and is great to use for this

```bash
go get github.com/labstack/echo/v4
mkdir cmd
touch cmd/main.go
```

### SIDE NOTE
if you see the following error, execute `go mod tidy` after importing `echo`

![Common Go Error](./images/go-error.png)

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

### In case I forget

```go
package main

import (
	"html/template"
	"io"

	"github.com/labstack/echo/v4"
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

type Count struct {
    Count int
}

func main() {

    e := echo.New()

    count := Count{Count: 0}

    e.Renderer = newTemplate()

    e.GET("/", func(c echo.Context) error {
        count.Count++
        return c.Render(200, "index.html", count)
    });

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

### s/html/htmx
Ok!  Lets get into the ackshual course!

<br/>
<br/>

Lets add a button and an endpoint to increment count!  The results should be
displayed on the page.  First lets add the endpoint to our server

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

### Code Updates
```go
    e.GET("/", func(c echo.Context) error {
        return c.Render(200, "index.html", count)
    });

    e.POST("/count", func(c echo.Context) error {
        count.Count++
        return c.Render(200, "index.html", count)
    });
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

### Lets add htmx and the button to our html!

// views/index.html
```html
<html>
    <head>
        <title>Our First HTML Site!</title>
        <script src="https://unpkg.com/htmx.org/dist/htmx.min.js"></script>
    </head>
    <body>
        Count {{ .Count }}
        <button hx-post="/count">Moar Count</button>
    </body>
</html>
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

### What in the world has happened?
I don't think i like these results... What is going on?

<br/>
<br/>

I think its time to introduce HTMX in a more structured way... don't you think?

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

### HATEOS
* Hypermedia As The Engine Of Application State
* Does that mean HTML is finally a programming language?
* Does that mean I am an HTML Engineer?

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

### How does HTMX Work?
Its ackshually quite simple.  To the point of being so simple it must be
incorrect.  Your client has points in HTML which can interact with the server,
and the server will respond with moar HTML.

<br/>
<br/>

* Common argument: Aren't servers suppose to respond with JSON?
  - What if I need a different view?
  - Why would my server understand the representation of the client?

<br/>
<br/>

#### 1. Accept Header
You get your cake and you can eat it too.

[Accept Header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept)
![Accept MDN Headers Page](./images/AcceptHeaders.png)

#### 2. An important concept about state
In general, every time you take a state and interpret it you have a chance for
business logic bug

**Current Approach**
1. your server knows the state and produces a "view" into it (json being most popular)
1. that view is transfered across the turtles
1. that view is then decoded by the client (typically JSON.parse)
1. reconcile current state to new state
1. determine what views should be updated

**HTMX Approach**
1. your server knows the state and produces a "view" (html)
1. that view is transfered across the turtles
1. that view is then decoded by the htmx and placed according to the rules set on the originating element

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

### So how does HTMX work?
Any element can have attributes that trigger htmx interactivity.

```HTML
<div hx-get="/some/resource">
</div>
```

<br/>
<br/>

**What happens**
1. htmx will bind an `onClick` handler on the `div` above
1. when the div is clicked a `GET` request will be made to `/some/resource`
1. when the server responds the contents of `div` will be swapped out and replaced with the servers response

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

### So what happened and lets fixed it!
* lets debug what happened
* lets fix the issue!

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

### Do we like this?
Well... its not "efficient" ... lets make it efficient?

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

