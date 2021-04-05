# Form

Redwood provides several helpers to make your life easier when working with forms. All of Redwood's form helpers are simple wrappers around [react-hook-form](https://react-hook-form.com/) that makes it even easier to use in many cases. If Redwood's form helpers aren't flexible enough for you, you can always use `react-hook-form` directly, or use any other [form builder](https://github.com/jaredpalmer/formik) that works with React.

> **WARNING:** RedwoodJS software has not reached a stable version 1.0 and should not be considered suitable for production use. In the "make it work; make it right; make it fast" paradigm, Redwood is in the later stages of the "make it work" phase.

Redwood currently provides the following form components:

* `<Form>` surrounds all form elements and provides contexts for errors and form submission
* `<FormError>` displays an error message, typically at the top of your form, containing error messages from the server
* `<Label>` is used in place of the HTML `<label>` tag and can respond to errors with different styling
* `<SelectField>` is used in place of the HTML `<select>` tag and responds to errors with different styling
* `<TextAreaField>` is used in place of the HTML `<textarea>` tag and can accept validation options and be styled differently in the presence of an error
 The default validation for `required` is `false` for this field, To make it required, please pass the prop `validation={{ required: true }}` for all the `<RadioField>`.
* `<FieldError>` will display error messages from form validation and server errors
* `<Submit>` is used in place of `<button type="submit">` and will trigger a validation check and "submission" of the form (actually executes the function given to the `onSubmit` attribute on `<Form>`)
* HTML `<input>` types are available as a component `<TypeField>` where `Type` is one of the official [HTML types](https://www.w3schools.com/html/html_form_input_types.asp). They can accept validation options and be styled differently in the presence of an error. We'll refer to these collectively as "InputFields" below. The full list is:
    * `<ButtonField>`
    * `<CheckboxField>`
    * `<ColorField>`
    * `<DateField>`
    * `<DatetimeLocalField>`
    * `<EmailField>`
    * `<FileField>`
    * `<HiddenField>`
    * `<ImageField>`
    * `<MonthField>`
    * `<NumberField>`
    * `<PasswordField>`
    * `<RadioField>`
    * `<RangeField>`
    * `<ResetField>`
    * `<SearchField>`
    * `<SubmitField>`
    * `<TelField>`
    * `<TextField>`
    * `<TimeField>`
    * `<UrlField>`
    * `<WeekField>`

Some fields also share options:

`<Label>`, `<TextAreaField>` and all InputFields take similar options for styling in the presence of an error.

The `<TextAreaField>` and all InputFields accept the same options for validation.

`<FieldError>` only takes styling for errors and is only rendered if there is an error on the associated field.

Certain `<TypeField>`s have type coercion built-in, like `<NumberField>`, but you can always override the coercion or, if it's not built-in, set it manually via the `transformValue` attribute. See [transformValue](#transformvalue).

A typical React component using these helpers would look something like this Contact Us page form:

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

Any form you want Redwood to provide validation and error styling on should be surrounded by this tag. Except for the view attributes specific to validation and submission, props are passed down to the regular `<form>` tag that is rendered.

```html
<Form onSubmit={onSubmit} className="form">...</Form>

<!-- Renders: <form class="form">...</form> -->
```

### `<Form>` Attributes

Besides the attributes listed below, any additional attributes are passed on as props to the underlying `<form>` tag which is rendered.

#### onSubmit

The `onSubmit` prop accepts a function name or anonymous function to be called *if* validation is successful. This function will be called with a single object containing name/value pairs of all *Redwood form helper* fields in your form. Meaning if you mix `<input>` and `<TextField>` form fields, only `<TextField>` names/values will be present.

Behind the scenes the handler given to `onSubmit` is given to [react-hook-form](https://react-hook-form.com/api#handleSubmit)'s `handleSubmit` function with the data transformed as specified by each `Input`'s `transformValue` prop.  See [`transformValue`](#transformvalue) attribute.

#### validation

The `validation` prop accepts an object containing options for react-hook-form, which Redwood's `<Form>` is a simple wrapper around. See the [useForm](https://react-hook-form.com/api#useForm) for the full list of options.

The object given to `validation` is forwarded to `useForm` behind the scenes when creating the form. For example, to validate your form fields when the user leaves a field instead of waiting for them to click the submit button:

```javascript
<Form validation={{ mode: 'onBlur' }}>
```

#### formMethods

If you need access to the functions that `useForm` gives you then you can manually call it in your component, but you'll need to provide those functions to `<Form>` so that it can use those instead of calling `useForm` itself and generating its own instance of them.

```javascript
import { useForm } from 'react-hook-form'

const ContactPage = () => {
  const formMethods = useForm()

  const onSubmit = (data) => {
    console.info(data)
    formMethods.reset()
  }

  return (
    <Form formMethods={formMethods} onSubmit={onSubmit}>
      // ...
    </Form>
  )
}
```

## `<FormError>`

This helper will render a `<div>` containing a "title" message and a `<ul>` containing any errors reported by the server when trying to save your form data.

If an error is present the following HTML is rendered (`className` and `style` attributes can be passed to each element, see the `*ClassName` and `*Style` attribute descriptions below):

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

In this case if you provided validation for `email` in the `<TextField>` component itself then you wouldn't see this message at the top of your form—form validation would have caught it before it got to the GraphQL layer.

### `<FormError>` Attributes

#### error

An object containing server errors. Redwood expects this object to be from GraphQL listing errors in validation before submission to the server, or errors from the server when trying to mutate the data store in response to the GraphQL mutation sent across the wire.

The easiest way to get your errors in this format is give `<FormError>` the `error` property created by the `useMutation` hook provided by `@redwoodjs/web` (the body of the form has been left out to keep this code short-ish):

```javascript
const CREATE_CONTACT = gql`
  mutation CreateContactMutation($input: ContactInput!) {
    createContact(input: $input) {
      id
    }
  }
`
import { useMutation } from '@redwoodjs/web'

const ContactPage = (props) => {
  const [create, { loading, error }] = useMutation(CREATE_CONTACT)

  const onSubmit = (data) => {
    create({ variables: { input: data }})
  }

  return (
    <Form onSubmit={onSubmit}>
      <FormError error={error} />
      // ...
    </Form>
  )
}
```

If `error` contains the object that `<FormError>` is expecting then the errors will be shown (in this case at the top of the form) otherwise nothing is rendered.

#### wrapperStyle / wrapperClassName

`style` and `className` attributes given to the `<div>` that surrounds the rest of the error messaging.

#### titleStyle / titleClassName

`style` and `className` attributes given to the `<p>` that contains the "title" of the error message.

#### listStyle / listClassName

`style` and `className` attributes given to the `<ul>` that surrounds each individual field error message.

#### listItemStyle / listItemClassName

`style` and `className` attributes given to the `<li>` that surround each individual field error message.

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
If the production environment is set to `development` or `test`, it will also issue a console warning upon a failed transformation.  It is recommended to set up your field validation to avoid cases of failed transformation.  In the specific case of the example above, it would be recommended to add a `validation={{ required: true }}` to the code as per the below.

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
