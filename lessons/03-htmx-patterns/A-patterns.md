---
title: "Patterns"
description: "some common patterns you may see in htmx"
---

### Practice makes perfect
As of right now I feel pretty proficient building tools with htmx
* pairing with v.0 is amazing

<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>

### The following examples
* Are directly taken from the [HTMX book](https://hypermedia.systems/htmx-in-action)

<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>

### The URL
The current URL can be controlled via htmx.  This can be great,
but it can also lead into some funny locations.

<br/>
<br/>

Lets say we created a contacts page and we wanted to allow deleting from the
contacts page.  What should happen?

<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>

### First the HTML for the delete button
```html
<button hx-delete="/contacts/{{ contact.Id }}"
      hx-indicator="#delete-indicator"
      hx-push-url="true"
      hx-target="body">
Delete Contact
</button>
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

### Disable the button
This takes advantage of more HTMX events and a touch of javascript.  Events can
be observered by using `htmx.logAll()`.  This will spam the console with all
the events that htmx processes and emits

```typescript
export function disableButton(button: HTMLButtonElement) {
    if (!button) {
        throw new Error("form without button");
    }

    button.removeAttribute("disabled", true);
    button.addEventListener("htmx:beforeRequest", function() {
        button.toggleAttribute("disabled", true);
    })

    button.addEventListener("htmx:beforeSwap", function() {
        button.toggleAttribute("disabled", true);
    })
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

### DELETE
How do we get back to the contacts page?  How does this work?

<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>

### Introducing 303
Wait... I thought it was 302.

<br/>
<br/>

**302**
![302](./images/302.png)

<br/>
<br/>

**303**
![303](./images/303.png)

<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>

### DELETEing from inline contacts vs from page?
You could imagine that we have a page for each contact in our application that
could have a delete button.

<br/>
<br/>

We need a way to tell the backend to redirect instead of NoContent response.

<br/>
<br/>

```html
<button hx-delete="/contacts/{{ contact.Id }}?redirect=true"
      hx-indicator="#delete-indicator"
      hx-push-url="true"
      hx-target="body">
Delete Contact
</button>
```

The `?redirect=true` allows us to encode within the url the behavior we want.
Remember, URLs can be state containers that have intention behind them, use it

<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>

### To The Next Problem!

<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>

### Too many contacts
Lets say that we had thousands of contacts, we would not want to send them all
down at once.  How can we accomplish this with htmx?

<br/>
<br/>

**hx-trigger**
### Non-standard Events

There are some additional non-standard events that htmx supports:

* load - triggered on load (useful for lazy-loading something)
* revealed - triggered when an element is scrolled into the viewport (also useful for lazy-loading). If you are using overflow in css like overflow-y: scroll you should use intersect once instead of revealed.
* intersect - fires once when an element first intersects the viewport. This supports two additional options:
    * root:<selector> - a CSS selector of the root element for intersection
    * threshold:<float> - a floating point number between 0.0 and 1.0, indicating what amount of intersection to fire the event on

<br/>
<br/>

**views/blocks.html**
```html
{{ block "blocks" . }}
    {{ range .Blocks }}
        <div style="background-color: #eee; margin: 2px">
            <span>{{ .Id }}</span>
        </div>
    {{ end }}

    {{ if .More }}
        <div hx-trigger="revealed" hx-swap="outerHTML" hx-get="/blocks?start={{ .Next }}"></div>
    {{ end }}
{{ end }}
```

<br/>
<br/>

### Contacts are similar
The contacts are similar in the sense that we may not be able to see them all
so a request for more is easily achieved with htmx

<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>

### Filtering?
Well filtering is a subset of the previous problem.  Like any list that is too
large you wont have all the data so when you do a filtering it will require a
server side call.

<br/>
<br/>

This pattern is known as the [Active Search](https://hypermedia.systems/more-htmx-patterns/#_active_search) pattern on the htmx in action book.

```html
<form action="/contacts" method="get" class="tool-bar">
    <label for="search">Search Term</label>
    <input id="search" type="search" name="q" value="{{ request.args.get('q') or '' }}" (1)
           hx-get="/contacts" (2)
           hx-trigger="search, keyup delay:200ms changed"/> (3)
    <input type="submit" value="Search"/>
</form>
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

### An Observation
In some sense, htmx returns to more of an "engineering" feel.

<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>


### There is much much more you can do
The question you should be asking yourself is "how much of my state can be
represented by a url + http codes?"

<br/>
<br/>

The answer is a shocking amount of it can be.  There are few applications that
cannot be and those are enumerated at the front of the htmx book.  But here is
one of my own.

<br/>
<br/>

* conways game of life
* spreadsheets
* maps

<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>

### Like and Subscribe
Hey... like and sub to my yt channel :)

<br/>

[ThePrimeagen](https://youtube.com/ThePrimeagen)
* produced videos.  been on a break for 3 months from this one, planning the comeback

<br/>

[ThePrimeTimeagen](https://youtube.com/ThePrimeTimeagen)
* memes, articles, and YT video tech reaction content.

<br/>

[TheVimeagen](https://youtube.com/@TheVimeagen)
* Long form programming content

<br/>

[ThePrimeagen on Twitch](https://twitch.tv/ThePrimeagen)
* Where all the YT channels get their content from

<br/>

[ThePrimeagen on Twitter](https://twitter.com/ThePrimeagen)
* lots of shoot posting

<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>

