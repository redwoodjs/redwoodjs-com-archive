# File Uploads

As you've probably heard, Redwood thinks the future is serverless. This concept introduces some interesting problems you may not have had to worry about in the past. For example: where do files go when you upload them—there's no server! Like many tasks you may have done [yourself](https://redwoodjs.com/tutorial/authentication) in the past, this is another job that we can farm out to a third party service.

## The Service

There are many services out there that handle file uploads and serving from a CDN. Two of the big ones are [Cloudinary](https://cloudinary.com) and [Filestack](https://filestack.com). We're going to demo a Filestack integration here because we've found it very easy to integrate. In addition to storing your uploads and making them available via a CDN they also offer on-the-fly image transformations so even if someone uploads a Retina-ready 5000px wide headshot, you can shrink it down and only serve a 100px version for their avatar in the upper right corner of your site. You save bandwidth and transfer costs.

We're going to sign up for a free plan which gives us 100 uploads a month, 1000 transformations (like resizing an image), 1GB of bandwidth, and 0.5GB of storage. That is more than enough for this demo and maybe even a low traffic production site.

Head over to https://dev.filestack.com/signup/free/ and sign up. Be sure to use a real email address because they're going to send you a confirmation email before you can log in. Once you verify your email you'll be dropped on your dashboard where your API key will be shown at the upper right:

![New image scaffold](https://user-images.githubusercontent.com/300/82616735-ec41a400-9b82-11ea-9566-f96089e35e52.png)

Copy that or at least keep the browser tab open because we're going to need it in a minute. (I already changed that key so don't bother trying to steal it!)

That's it on the Filestack side, on to the application.

## The App

Let's create a very simple DAM (Digital Asset Manager) that lets users upload and catalog images. They will be able to click the thumbnail to open a full-size version.

Create a new Redwood app:

```terminal
yarn create redwood-app uploader
cd uploader
```

The first thing we'll do is create an environment variable to hold our Filestack API key. This is a best practice so that the key isn't living in your repository for prying eyes to see. Add the key to the `.env` file in the root of our app:

```terminal
REDWOOD_ENV_FILESTACK_API_KEY=AM18i8xV4QpoiGwetoTWd
```

> We're prefixing with `REDWOOD_ENV_` here as an indicator to webpack that we want it to replace these variables with the actual values as it is processing pages and statically generating them. Otherwise our generated pages would still contain something like `process.env.FILESTACK_API_KEY`, which would not exist when the pages are static and being served from a CDN.

Now we can start our development server:

```terminal
yarn rw dev
```

### The Database

We'll create a single model to store our image data:

```javascript
// api/prisma/schema.prisma

model Image {
  id    Int    @default(autoincrement()) @id
  title String
  url   String
}
```

`title` will be a user-supplied name for this asset and `url` will contain the public URL that Filestack creates after an upload.

Create a migration and update the database:

```terminal
yarn rw db save
yarn rw db up
```

To make our lives easier let's scaffold the screens necessary to create/edit/delete an image and we'll modify those to add the uploader:

```terminal
yarn rw g scaffold image
```

Now head to http://localhost:8910/images/new and let's figure out what we need to do to add an image uploader:

![New image scaffold](https://user-images.githubusercontent.com/300/82694608-653f0b00-9c18-11ea-8003-4dc4aeac7b86.png)

## The Uploader

Filestack has a [React component](https://github.com/filestack/filestack-react) that handles all the uploading for us. Let's add the package:

```terminal
yarn workspace web add filestack-react
```

We know we'll want the uploader on our scaffolded form so let's import it and try replacing the **Url** input with it, giving it the API key:

```javascript{11,54}
// web/src/components/ImageForm/ImageForm.js

import {
  Form,
  FormError,
  FieldError,
  Label,
  TextField,
  Submit,
} from '@redwoodjs/forms'
import ReactFilestack from 'filestack-react'

const CSS = {
  label: 'block mt-6 text-gray-700 font-semibold',
  labelError: 'block mt-6 font-semibold text-red-700',
  input:
    'block mt-2 w-full p-2 border border-gray-300 text-gray-700 rounded focus:outline-none focus:border-gray-500',
  inputError:
    'block mt-2 w-full p-2 border border-red-700 text-red-900 rounded focus:outline-none',
  errorMessage: 'block mt-1 font-semibold uppercase text-xs text-red-700',
}

const ImageForm = (props) => {
  const onSubmit = (data) => {
    props.onSave(data, props?.image?.id)
  }

  return (
    <div className="box-border text-sm -mt-4">
      <Form onSubmit={onSubmit} error={props.error}>
        <FormError
          error={props.error}
          wrapperClassName="p-4 bg-red-100 text-red-700 border border-red-300 rounded mt-4 mb-4"
          titleClassName="mt-0 font-semibold"
          listClassName="mt-2 list-disc list-inside"
        />

        <Label
          name="title"
          className={CSS.label}
          errorClassName={CSS.labelError}
        >
          Title
        </Label>
        <TextField
          name="title"
          defaultValue={props.image?.title}
          className={CSS.input}
          errorClassName={CSS.inputError}
          validation={{ required: true }}
        />
        <FieldError name="title" className={CSS.errorMessage} />

        <ReactFilestack apikey={process.env.REDWOOD_ENV_FILESTACK_API_KEY} />

        <div className="mt-8 text-center">
          <Submit
            disabled={props.loading}
            className="bg-blue-600 text-white hover:bg-blue-700 text-xs rounded px-4 py-2 uppercase font-semibold tracking-wide"
          >
            Save
          </Submit>
        </div>
      </Form>
    </div>
  )
}

export default ImageForm
```

If you look closely there's a *little* button under the Title input:

![Pick file button](https://user-images.githubusercontent.com/300/82617171-1c3d7700-9b84-11ea-9e70-d005c419ebe1.png)

Clicking that actually launches the picker with all kinds of options, like picking a local file, providing a URL or even grabbing one from Facebook, Instagram or Google Drive. Not bad!

![Filestack picker](https://user-images.githubusercontent.com/300/82617240-51e26000-9b84-11ea-8aec-210b7a751e8c.png)

There's no reason to make the user click that button, let's just show the picker on the page when it loads by adding a couple of [options](https://github.com/filestack/filestack-react#props). We'll need to create a container for it to live in, so we'll add a `<div>` and give it an `id` attribute that we'll tell `<ReactFilestack>` about. We'll also give the `<div>` a couple of styles so that the picker doesn't collapse to 0px tall:

```javascript
// web/src/components/ImageForm/ImageForm.js

<ReactFilestack
  apikey={process.env.REDWOOD_ENV_FILESTACK_API_KEY}
  componentDisplayMode={{ type: 'immediate' }}
  actionOptions={{ displayMode: 'inline', container: 'picker' }}
/>
<div id="picker" style={{ marginTop: '2rem', height: '20rem' }}></div>
```

Great! You can even try uploading an image to make sure it works:

![Upload](https://user-images.githubusercontent.com/300/82618035-bb636e00-9b86-11ea-9401-61b8c989f43c.png)

> Make sure you click the **Upload** button that appears after picking your file.

If you go over to the Filestack dashboard you can see we've uploaded an image:

![Filestack dashboard](https://user-images.githubusercontent.com/300/82618057-ccac7a80-9b86-11ea-9cd8-7a9e80a5a20f.png)

But that doesn't help us attach anything to our database record. Let's do that.

## The Data

Let's see what's going on when an upload completes. The Filestack picker takes an `onSuccess` attribute with a function to call when complete:

```javascript{10-12,18}
// web/src/components/ImageForm/ImageForm.js

// imports and stuff...

const ImageForm = (props) => {
  const onSubmit = (data) => {
    props.onSave(data, props?.image?.id)
  }

  const onFileUpload = (response) => {
    console.info(response)
  }

  // form stuff...

  <ReactFilestack
    apikey={process.env.REDWOOD_ENV_FILESTACK_API_KEY}
    onSuccess={onFileUpload}
    componentDisplayMode={{ type: 'immediate' }}
    actionOptions={{ displayMode: 'inline', container: 'picker' }}
  />
```

Well lookie here:

![Uploader response](https://user-images.githubusercontent.com/300/82618071-ddf58700-9b86-11ea-9626-e093b4c8d853.png)

`filesUploaded[0].url` seems to be exactly what we need—the public URL to the image that was just uploaded. Excellent! How about we use a little state to track that for us so it's available when we submit our form:

```javascript{12,25,32}
// web/src/components/ImageForm/ImageForm.js

import {
  Form,
  FormError,
  FieldError,
  Label,
  TextField,
  Submit,
} from '@redwoodjs/forms'
import ReactFilestack from 'filestack-react'
import { useState } from 'react'

const CSS = {
  label: 'block mt-6 text-gray-700 font-semibold',
  labelError: 'block mt-6 font-semibold text-red-700',
  input:
    'block mt-2 w-full p-2 border border-gray-300 text-gray-700 rounded focus:outline-none focus:border-gray-500',
  inputError:
    'block mt-2 w-full p-2 border border-red-700 text-red-900 rounded focus:outline-none',
  errorMessage: 'block mt-1 font-semibold uppercase text-xs text-red-700',
}

const ImageForm = (props) => {
  const [url, setUrl] = useState(props?.image?.url)

  const onSubmit = (data) => {
    props.onSave(data, props?.image?.id)
  }

  const onFileUpload = (response) => {
    setUrl(response.filesUploaded[0].url)
  }

  return (
  // component stuff...

```

So we'll use `setState` to store the URL for the image. We default it to the existing `url` value, if it exists—remember that scaffolds use this same form for editing of existing records, where we'll already have a value for `url`. If we didn't store that url value somewhere then it would be overridden with `null` if we started editing an existing record!

The last thing we need to do is set the value of `url` in the `data` object before it gets sent on to the `onSave` handler:

```javascript{4,5}
// web/src/components/ImageForm/ImageForm.js

const onSubmit = (data) => {
  const dataWithUrl = Object.assign(data, { url })
  props.onSave(dataWithUrl, props?.image?.id)
}
```

Now try uploading a file and then saving the form:

![Upload done](https://user-images.githubusercontent.com/300/82702493-f5844c80-9c26-11ea-8fc4-0273b92034e4.png)

It worked! Next let's update the display here to actually show the image as a thumbnail and make it clickable to see the full version:

```javascript{61-63}
// web/src/components/Images/Images.js

import { useMutation } from '@redwoodjs/web'
import { Link, routes } from '@redwoodjs/router'

const DELETE_IMAGE_MUTATION = gql`
  mutation DeleteImageMutation($id: Int!) {
    deleteImage(id: $id) {
      id
    }
  }
`

const MAX_STRING_LENGTH = 150

const truncate = (text) => {
  let output = text
  if (text && text.length > MAX_STRING_LENGTH) {
    output = output.substring(0, MAX_STRING_LENGTH) + '...'
  }
  return output
}

const timeTag = (datetime) => {
  return (
    <time dateTime={datetime} title={datetime}>
      {new Date(datetime).toUTCString()}
    </time>
  )
}

const ImagesList = ({ images }) => {
  const [deleteImage] = useMutation(DELETE_IMAGE_MUTATION)

  const onDeleteClick = (id) => {
    if (confirm('Are you sure you want to delete image ' + id + '?')) {
      deleteImage({ variables: { id }, refetchQueries: ['IMAGES'] })
    }
  }

  return (
    <div className="bg-white text-gray-900 border rounded-lg overflow-x-scroll">
      <table className="table-auto w-full min-w-3xl text-sm">
        <thead>
          <tr className="bg-gray-300 text-gray-700">
            <th className="font-semibold text-left p-3">id</th>
            <th className="font-semibold text-left p-3">title</th>
            <th className="font-semibold text-left p-3">file</th>
            <th className="font-semibold text-left p-3">&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {images.map((image) => (
            <tr
              key={image.id}
              className="odd:bg-gray-100 even:bg-white border-t"
            >
              <td className="p-3">{truncate(image.id)}</td>
              <td className="p-3">{truncate(image.title)}</td>
              <td className="p-3">
                <a href={image.url} target="_blank">
                  <img src={image.url} style={{ maxWidth: '50px' }} />
                </a>
              </td>
              <td className="p-3 pr-4 text-right whitespace-no-wrap">
                <nav>
                  <ul>
                    <li className="inline-block">
                      <Link
                        to={routes.image({ id: image.id })}
                        title={'Show image ' + image.id + ' detail'}
                        className="text-xs bg-gray-100 text-gray-600 hover:bg-gray-600 hover:text-white rounded-sm px-2 py-1 uppercase font-semibold tracking-wide"
                      >
                        Show
                      </Link>
                    </li>
                    <li className="inline-block">
                      <Link
                        to={routes.editImage({ id: image.id })}
                        title={'Edit image ' + image.id}
                        className="text-xs bg-gray-100 text-blue-600 hover:bg-blue-600 hover:text-white rounded-sm px-2 py-1 uppercase font-semibold tracking-wide"
                      >
                        Edit
                      </Link>
                    </li>
                    <li className="inline-block">
                      <a
                        href="#"
                        title={'Delete image ' + image.id}
                        className="text-xs bg-gray-100 text-red-600 hover:bg-red-600 hover:text-white rounded-sm px-2 py-1 uppercase font-semibold tracking-wide"
                        onClick={() => onDeleteClick(image.id)}
                      >
                        Delete
                      </a>
                    </li>
                  </ul>
                </nav>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ImagesList
```

![Image](https://user-images.githubusercontent.com/300/82702575-1fd60a00-9c27-11ea-8d2f-047bcf4e9cae.png)

## The Transform

Remember when we mentioned that Filestack can save you bandwidth by transforming images on the fly? This page is a perfect example—the image is never bigger than 50px, why pull down the full resolution just for that tiny display? Here's how we can tell Filestack that whenever we grab this instance of the image, it only needs to be 100px. Why 100px? Most phones and many laptops and desktop displays are now 4k or larger. Images are actually displayed at at least double resolution on these displays, so even though it's "50px" it's really 100px when shown on these displays. So you'll usually want to bring down all images at twice their intended display resolution.

We need to add a special indicator to the URL itself to trigger the transform so let's add a function that does that for a given image URL (this can go either inside or outside of the component definition):

```javascript
// web/src/components/Images/Images.js

const thumbnail = (url) => {
  const parts = url.split('/')
  parts.splice(3, 0, 'resize=width:100')
  return parts.join('/')
}
```

What this does is turn a URL like `https://cdn.filestackcontent.com/81m7qIrURxSp7WHcft9a` into `https://cdn.filestackcontent.com/resize=width:100/81m7qIrURxSp7WHcft9a`.

Now we'll use the result of that function in the `<img>` tag:

```javascript
// web/src/components/Images/Images.js

<img src={thumbnail(image.url)} style={{ maxWidth: '50px' }} />
```

Starting with an uploaded image of 157kB the 100px thumbnail clocks in at only 6.5kB! Optimizing image delivery is almost always worth the extra effort!

You can read more about the available transforms over at [Filestack's API reference](https://www.filestack.com/docs/api/processing/).

## The Improvements

It would be nice if, after uploading, you could see the image you uploaded. Likewise, when editing an image, it would be helpful to see what's already attached. Let's make those improvements now.

We're already storing the attached image URL in state, so let's use the existence of that state to show the attached image. In fact, let's also hide the uploader and assume you're done (you'll be able to show it again if needed):

```javascript{14,18}
// web/src/components/ImageForm/ImageForm.js

<ReactFilestack
  apikey={process.env.REDWOOD_ENV_FILESTACK_API_KEY}
  onSuccess={onFileUpload}
  componentDisplayMode={{ type: 'immediate' }}
  actionOptions={{ displayMode: 'inline', container: 'picker' }}
/>
<div
  id="picker"
  style={{
    marginTop: '2rem',
    height: '20rem',
    display: url ? 'none' : 'block',
  }}
></div>

{url && <img src={url} style={{ marginTop: '2rem' }} />}
```

Now if you create a new image you'll see the picker, and as soon as the upload is complete the uploaded image will pop into place. If you go to edit an image you'll see the file that's already attached.

> You should probably use the same resize URL trick here so make sure it doesn't try to display a 10MB image immediately after uploading it. A max width of 500px could be good...

Now let's just add the ability to bring back the uploader if you decide you want to change the image. We can do that by clearing the image that's in state:

```javascript{18-29}
// web/src/components/ImageForm/ImageForm.js

<ReactFilestack
  apikey={process.env.REDWOOD_ENV_FILESTACK_API_KEY}
  onSuccess={onFileUpload}
  componentDisplayMode={{ type: 'immediate' }}
  actionOptions={{ displayMode: 'inline', container: 'picker' }}
/>
<div
  id="picker"
  style={{
    marginTop: '2rem',
    height: '20rem',
    display: url ? 'none' : 'block',
  }}
></div>

{url && (
  <div>
    <img src={url} style={{ display: 'block', margin: '2rem 0' }} />
    <a
      href="#"
      onClick={() => setUrl(null)}
      className="bg-blue-600 text-white hover:bg-blue-700 text-xs rounded px-4 py-2 uppercase font-semibold tracking-wide"
    >
      Replace Image
    </a>
  </div>
)}
```

![Replace image button](https://user-images.githubusercontent.com/300/82719274-e7055780-9c5d-11ea-9a8a-8c1c72185983.png)

We're borrowing the styles from the submit button and made sure the image has both a top and bottom margin so it doesn't crash into the new button.

## The Wrapup

Files uploaded! There's plenty of ways to integrate a file picker and this is just one, but we think it's simple, yet flexible. We use the same technique on the [example-blog](https://github.com/redwoodjs/example-blog).

Have fun and get uploading!
