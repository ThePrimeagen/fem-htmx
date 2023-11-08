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

**I may mess up** and accidentally correctly program something... if that
happens i'll have to undo that part :)

<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
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
![HTTP Status Code Tom Foolery](./images/200.jpg)
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

Which also means i'll try to keep everything in one file and i will try to be
as grug brain as possible while programming

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
the html required! (views/index.html).

<br/>
<br/>

* we should display a `count` that represents how many times the page has been refreshed.


<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
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

### Note on server
**SIDE NOTE** If you are adept and know how to launch a server in your favorite language and know how to:
* produce HTML on the server
* respond with various status codes
* make routes with params in them (i.e.: /contacts/:id)
* read query params
* create verb based routes: `GET`, `POST`, `DELETE`

<br/>
<br/>

Then feel free to use the server/templating of your choice, because this isn't
very complicated server activity.  We will not be using even sqlite for storage.

<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>

### Setting up the server
We will use echo... I know shut up, everyone has their favorite server, this
one is just simple and is great to use for this

```bash
go get github.com/labstack/echo/v4
go get github.com/labstack/echo/v4/middleware
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

type Count struct {
    Count int
}

func main() {

    e := echo.New()

    count := Count{Count: 0}

    e.Renderer = newTemplate()
    e.Use(middleware.Logger())

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

### Principle: HATEOAS
* Hypermedia As The Engine Of Application State
* Does that mean HTML is finally a programming language?
* Does that mean I am an HTML Engineer?

<br/>
<br/>

Its existed for a long time
[HATEOAS Circa 2011](https://steveklabnik.com/writing/some-people-understand-rest-and-http)

<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>

### Excalidraw how htmx works
The easiest way to understand htmx is to see it drawn out

<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>

### Common Arguments
**Aren't servers suppose to respond with JSON?**
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
  - this contains a slight lie

<br/>
<br/>

**Isn't producing HTML Slow?**
- No, its quite simple why

<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>

### HTMXify: One more time
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
(notes)
* button + count
* count by id (debug)
* outer

<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>

