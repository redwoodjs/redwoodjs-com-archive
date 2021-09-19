# Forms

Redwood provides several helpers to make building forms easier. 
All of Redwood's helpers are simple wrappers around [React Hook Form](https://react-hook-form.com/) (RHF) that make it even easier to use in most cases. 

If Redwood's helpers aren't flexible enough for you, you can use React Hook Form directly. `@redwoodjs/forms` exports everything it does:

```javascript
import { 
  useForm, 
  useFormContext, 
  /**
   * Or anything else React Hook Form exports!
   * 
   * @see {@link https://react-hook-form.com/api}
   */
} from '@redwoodjs/forms'
```

## Overview

`@redwoodjs/forms` exports the following components:

| Component         | Description                                                                                                                                                   |
|:------------------|:--------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `<Form>`          | Surrounds all components, providing form and error contexts                                                                                                   |
| `<FormError>`     | Displays error messages from the server. Typically placed at the top of your form.                                                                            |
| `<Label>`         | Used in place of the HTML `<label>` tag. Accepts error-specific styling                                                                                       |
| `<InputField>`    | Used in place of the HTML `<input>` tag. Accepts validation options and error-specific styling (also see the list of input field components enumerated below) |
| `<SelectField>`   | Used in place of the HTML `<select>` tag. Accepts validation options and error-specific styling                                                               |
| `<TextAreaField>` | Used in place of the HTML `<textarea>` tag. Accepts validation options and error-specific styling                                                             |
| `<FieldError>`    | Displays error messages if the field with the same `name` prop has validation errors. Only renders if there's an error on the associated field                |
| `<Submit>`        | Used in place of `<button type="submit">`. Triggers validation and "submission" (executes the function passed to `<Form>`'s `onSubmit` prop)                  |

All HTML `<input>` types are also available as components. They follow the naming convention `<TypeField>`, where `Type` is one of the official [HTML types](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#input_types). 
They accept validation options and error-specific styling. 

We'll refer to them collectively as "input fields".
The full list is:
- `<ButtonField>`
- `<CheckboxField>`
- `<ColorField>`
- `<DateField>`
- `<DatetimeLocalField>`
- `<EmailField>`
- `<FileField>`
- `<HiddenField>`
- `<ImageField>`
- `<MonthField>`
- `<NumberField>`
- `<PasswordField>`
- `<RadioField>`
- `<RangeField>`
- `<ResetField>`
- `<SearchField>`
- `<SubmitField>`
- `<TelField>`
- `<TextField>`
- `<TimeField>`
- `<UrlField>`
- `<WeekField>`

To avoid repeating ourselves too much, all components ending in `Field` (i.e. all input fields, along with `<SelectField>` and `<TextArea>`) accept at least the following props:

| Prop             | Description                                                                                                                                                                                                     |
|:-----------------|:----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `name`           | The name of the field. React Hook Form uses it a key to hook it up with everything else else                                                                                                                    |
| `validation`     | All your validation logic. Accepts all of React Hook Form's [`register` options](https://react-hook-form.com/api/useform/register), plus the Redwood-exclusive coercion helpers `valueAsBoolean`, `valueAsJSON` |
| `errorClassName` | The class name to apply if there's an error                                                                                                                                                                     |
| `errorStyle`     | The style to apply if there's an error                                                                                                                                                                          |

All other props passed to these components are forwarded to the tag they render.

### Example

A typical React component using these helpers would look something like this:

```javascript
import {
  Form,
  Label,
  TextField,
  TextAreaField,
  FieldError,
  Submit,
} from '@redwoodjs/forms'

const ContactPage = () => {
  const onSubmit = (data) => {
    console.log(data)
  }

  return (
    <Form onSubmit={onSubmit}>
      <Label name="name" className="label" errorClassName="label error" />
      <TextField
        name="name"
        className="input"
        errorClassName="input error"
        validation={{ required: true }}
      />
      <FieldError name="name" className="error-message" />

      <Label name="email" className="label" errorClassName="label error" />
      <TextField
        name="email"
        className="input"
        errorClassName="input error"
        validation={{
          required: true,
          pattern: {
            value: /[^@]+@[^\.]+\..+/,
          },
        }}
      />
      <FieldError name="email" className="error-message" />

      <Label name="message" className="label" errorClassName="label error" />
      <TextAreaField
        name="message"
        className="input"
        errorClassName="input error"
        validation={{ required: true }}
      />
      <FieldError name="message" className="error-message" />

      <Submit className="button">Save</Submit>
    </Form>
  )
}
```

## `<Form>`

Any form you want Redwood to validate and style in the presence errors should be surrounded by this tag. 

| Prop          | Description                                                                                                                                |
|:--------------|:-------------------------------------------------------------------------------------------------------------------------------------------|
| `config`      | Accepts an object containing options for React Hook Form's [`useForm` hook](https://react-hook-form.com/api/useform)                       |
| `formMethods` | The functions returned from `useForm`. You only need this prop if you need to access to one of the functions that `useForm` returns        |
| `onSubmit`    | Accepts a function to be called *if* validation succeeds. Called with an object containing name-value pairs of all the fields in your form |

All other props are forwarded to the `<form>` tag that it renders.

### `<Form>` Explained

`<Form>` encapsulates React Hook Form's `useForm` hook and `<FormProvider>` context, along with Redwood's `ServerError` context.
It's hard to talk about this component without getting into the nitty-gritty of React Hook Forms.

`useForm` is React Hook Form's major hook.
It returns a bunch of functions, one of which is `register`, which you use to "register" fields into React Hook Form so it can validate them. 
(This has to do with [controlled vs. unctrolled components](https://reactjs.org/docs/uncontrolled-components.html). React Hook Form takes the latter approach.)

All of Redwood's form helpers need the `register` function to do what they do. But they don't get it straight from `<Form>` because they could be nested arbitrarily deep. That's where `<FormProvider>` comes in: by passing the functions returned from `useForm` to `<FormProvider>`, Redwood's helpers can just use `useFormContext` to get what they need. 

### Using `formMethods`

`useForm` returns a function `reset`, which resets the form's fields. 
To access it, you have to call `useForm` yourself. 
But you still need to pass `useForm`'s return to the `<FormProvider>` so that Redwood's helpers can register themselves:

```javascript
import { useForm } from 'react-hook-form'

const ContactPage = () => {
  const formMethods = useForm()

  const onSubmit = (data) => {
    console.log(data)
    formMethods.reset()
  }

  return (
    <Form formMethods={formMethods} onSubmit={onSubmit}>
      // Still works!
      <TextField name="name" validation={{ required: true }}>
    </Form>
  )
}
```

## `<FormError>`

This helper renders a `<div>` containing a "title" message and a `<ul>` enumerating any errors reported by the server when trying to save your form.

For example, let's say you have a form with a `<TextField>` for a user's email address, but you didn't provide any validation on it:

```javascript{12,20}
import { useMutation } from '@redwoodjs/web'

const CREATE_CONTACT = gql`
  mutation CreateContactMutation($input: ContactInput!) {
    createContact(input: $input) {
      id
    }
  }
`

const ContactPage = () => {
  const [create, { loading, error }] = useMutation(CREATE_CONTACT)

  const onSubmit = (data) => {
    create({ variables: { input: data }})
  }

  return (
    <Form onSubmit={onSubmit}>
      <FormError error={error}>
      // No validation—any email goes!
      <TextField name="email" />
    </Form>
  )
}
```

Since there's no validation, anything goes!
On the client at least.
GraphQL is strongly typed, so it's not going to let just anything through.
Instead it'll throw an error and bubble it back up to the top (via the `error` object returned by the `useMutation` hook) where `<FormError>` can render something like:

```html
<div>
  <p>
    Can't create new contact:
  </p>
  <ul>
    <li>
      email is not formatted like an email address
    </li>
  </ul>
</div>
```

## `<Label>`

Generates an HTML `<label>` tag but is given different `style` and `className` attributes depending on whether the field it is associated with (has the same `name` attribute) has a validation error.

This tag can be self closing, in which case the `name` becomes the text of the label:

```html
<Label name="name" className="input" errorClassName="input error" />

<!-- Renders: <label for="name" class="input">name</label> -->
```

It can also have standard separate open/close tags and take text inside, in which that text will be the text of the rendered `<label>`:

```html
<Label name="name" className="input" errorClassName="input error">Your Name</Label>

<!-- Renders: <label for="name" class="input">Your Name</label> -->
```

### `<Label>` Attributes

Besides the attributes listed below, any additional attributes are passed on as props to the underlying `<label>` tag which is rendered.

#### name

The name of the field that this label is connected to. This should be the same as the `name` attribute on the `<TextField>`, `<TextAreaField>` or `<SelectField>` this label is for.

#### errorStyle / errorClassName

The `style` and `className` that should be passed to the HTML `<label>` tag that is generated *if* the field with the same `name` has a validation error.

## `<SelectField>`

Generates an HTML `<select>` field and allows the user to select a value from the field.  Validation and error can be performed as the field is registered with `react-hook-form`.  It is also possible to select multiple values from the field using the `multiple` attribute.  When the multiple value attribute is `true` then the return from this field will be an array of values returned in the same order as the list of options, not in the order they were selected.

```html
<SelectField name="name" validation={{required:true}}>
   <option>Option 1</option>
   <option>Option 2</option>
   <option>Option 3</option>
</SelectField>

<!-- Renders 
  <select id="name" validation="Object object">
    <option>Option 1</option>
    <option>Option 2</option>
    <option>Option 3</option>
  </select>
-->
```
### Attributes

Besides the attributes listed below, any additional attributes are passed on as props to the underlying `<select>` tag which is rendered

#### name

The name of this field which will be used as the key in the object sent to the form's onSubmit handler if the field passes validation. Any associated <Label> or <FieldError> helpers must have the same value for their name attribute in order to be connected properly.

```html
<SelectField name="operatingSystem">
  <option>"MacOS"</option>
  <option>"Windows 10"</option>
</SelectField>  

<!-- The onSubmit handler will receive { operatingSystem:"MacOS" } if that were the option chosen -->

```
When the `multiple` attribute is set to `true`

```html
<SelectField name="toppings" multiple={true}>
  <option>"lettuce"</option>
  <option>"tomato"</option>
  <option>"pickle"</option>
  <option>"cheese"</option>
</SelectField>  

<!-- The the user chose the lettuce, tomato and cheese options the onSubmit handler will receive { toppings:["lettuce", "tomato", "cheese"] } -->
```

#### validation

Options that define how this field should be validated. The options are passed to the underlying `register` function provided by `react-hook-form`. The full list of possible values can be found in the [react-hook-form docs](https://react-hook-form.com/api#register) (ignore the usage of `ref` as that is called automaticaly for you by Redwood).

In these two examples, one with multiple field selection, validation requires that the field be selected and there is a custom validate callback that ensures the user does not select the first value in the dropdown menu. 

```html
<SelectField
  name="selectSingle"
  validation={{
    required: true,
    validate: {
      matchesInitialValue: (value) => {
        return (
          value !== 'Please select an option' ||
          'Select an Option'
        )
      },
    },
  }}
>
  <option>Please select an option</option>
  <option>Option 1</option>
  <option>Option 2</option>
</SelectField>
<FieldError name="selectSingle" style={{ color: 'red' }} />

```

```html
<SelectField
  name="selectMultiple"
  multiple={true}
  validation={{
    required: true,
    validate: {
      matchesInitialValue: (value) => {
        let returnValue = [true]
        returnValue = value.map((element) => {
          if (element === 'Please select an option')
            return 'Select an Option'
        })
        return returnValue[0]
      },
    },
  }}
>
  <option>Please select an option</option>
  <option>Option 1</option>
  <option>Option 2</option>
</SelectField>
<FieldError name="selectMultiple" style={{ color: 'red' }} />

```

### transformValue

Typically a `<SelectField>` will return a string, but similar to other InputFields, you can set the `<SelectField>`'s `transformValue` attribute to `Boolean`, `Float`, `Int`, `Json`, or a custom function.

A use-case example is when `<SelectField>` is being used to select a numeric identifier, which can then be passed back to the api.  Without the `transformValue` attribute, the `<SelectField>` would return a string.  However, as per the example below, the `transformValue` can be utilized to return an `Int` or another type. 

```javascript
<SelectField name="select" transformValue="Int">
  <option value={1}>Option 1</option>
  <option value={2}>Option 2</option>
  <option value={3}>Option 3</option>
</SelectField>

```

For the example above, if Option 3 is selected, the form `onSubmit` function will be passed data as follows:
```
{
  select: 3,
}
```
## InputFields

Inputs are the backbone of most forms. `<TextField>` renders an HTML `<input type="text">` field, but is registered with `react-hook-form` to provide some validation and error handling.
Note that certain InputFields handle type coercion automatically, but you can always override the coercion or, if it's not built-in, set it manually via the `transformValue` attribute (see [transformValue](#transformvalue)).

```html
<TextField name="name" className="input" />

<!-- Renders <input type="text" name="name" class="input" /> -->
```

### InputFields Attributes

Besides the attributes listed below, any additional attributes are passed on as props to the underlying `<input>` tag which is rendered.

#### name

The `name` of this field which will be used as the key in the object sent to the form's `onSubmit` handler if the field passes validation. Any associated `<Label>` or `<FieldError>` helpers must have the same value for their `name` attribute in order to be connected properly.

```html
<TextField name="name" />

<!-- If the input contains "Rob" then the onSubmit handler receives: { name: "Rob" } -->
```

#### errorStyle / errorClassName

The `style` and `className` that should be passed to the HTML `<input>` tag that is generated *if* this field has a validation error.

#### validation

Options that define how this field should be validated. The options are passed to the underlying `register` function provided by `react-hook-form`. The full list of possible values can be found in the [react-hook-form docs](https://react-hook-form.com/api#register) (ignore the usage of `ref` as that is called automaticaly for you by Redwood).

```javascript
<TextField
  name="email"
  validation={{
    required: true,
    pattern: {
      value: /[^@]+@[^\.]+\..+/,
    },
  }}
/>
```

### dataType

This attribute has been deprecated. See [transformValue](#transformvalue).

### transformValue

If the type to coerce the input to can’t be inferred automatically, like making a `Float` from a `<TextField>` for example, you can set the InputField's `transformValue` attribute to `Boolean`, `DateTime`, `Float`, `Int`, or `Json`.

You can also pass a function to `transformValue`. For instance, you might remove commas from large numbers.

```javascript
<TextField
  name='revenue'
  transformValue={(str) => parseInt(str.replace(/,/g, ''), 10)}
  // '42,000,000' => 42000000
/>
```

If the transformValue is set to `DateTime`, `Float`, `Int`, or `Json` and the transformation fails, the form submission will gracefully return an `undefined` for that input.  For example:

```javascript
<Form onSubmit={submit}>
  <NumberField name="intField" defaultValue="" transformValue="Int" />
</Form>
```

If the `<NumberField>` is not modified and remains empty, it will return `{ intField: undefined }` into the `onSubmit` function, as an empty string cannot be converted to an integer.
If the `NODE_ENV` environment variable is set to `development` or `test`, it will also issue a console warning upon a failed transformation.  It is recommended to set up your field validation to avoid cases of failed transformation.  In the specific case of the example above, it would be recommended to add a `validation={{ required: true }}` to the code as per the below.

```javascript
<Form onSubmit={onSubmit}>
  <NumberField name="intField" defaultValue="" transformValue="Int" validation={{ required: true }} />
</Form>
```

## `<TextAreaField>`

### `<TextAreaField>` Attributes

Besides the attributes listed below, any additional attributes are passed on as props to the underlying `<textarea>` tag which is rendered.

#### name

See InputFields [name](#inputfields-attributes)

### transformValue

See InputField's [transformValue](#inputfields-attributes) for standard capabilities.

In addition, if the `transformValue` of a `<TextAreaField>` is set to `Json` it will automatically apply a JSON validation to the `<TextAreaField>` in addition to a JSON transformation at the time of form submission.  For example, the below will have JSON validation:

```javascript
<Form onSubmit={onSubmit}>
  <TextAreaField
    name="jsonField"
    transformValue="Json"
  />
  <Submit>Save</Submit>
</Form>
```

Caveat:  JSON validation will not be applied if a custom validation function, such as `fcn` is provided via the prop as follows: `validation={{ validate: fcn }}`

#### validation

See InputFields [validation](#inputfields-attributes)

#### errorStyle / errorClassName

See InputFields [errorStyle](#inputfields-attributes)

## `<FieldError>`

Renders a `<span>` containing any validation error message *if* the field with the same `name` attribute has a validation error. Otherwise renders nothing.

```html
<FieldError name="name" className="error-message">

<!-- Renders: <span class="error-message">name is required</span> -->
```

### `<FieldError>` Attributes

Any attributes not listed below are passed through to the underlying `<span>` tag which is rendered to contain the error message.

#### name

The same as the `name` of the input that this should show the error message for.

## `<Submit>`

Renders a `<button>` tag of type "submit":

```html
<Submit className="error-message">Save</Submit>

<!-- Renders: <button type="submit" class="button">Save</button> -->
```

### `<Submit>` Attributes

Any attributes given to `<Submit>` are passed through to the underlying `<button>` tag which is rendered.
