# Prisma Relations and Redwood's Generators

These docs apply to Redwood v0.25 and greater. Previous versions of Redwood had limitations when creating scaffolds for any one-to-many or many-to-many relationships. Most of those have been resolved so you should definitely [upgrade to 0.25](https://community.redwoodjs.com/t/upgrading-to-redwoodjs-v0-25-and-prisma-v2-16-db-upgrades-and-project-code-mods/1811) if at all possible!

## Many-to-many Relationships

[Here](https://www.prisma.io/docs/concepts/components/prisma-schema/relations#many-to-many-relations)
are Prisma's docs for creating many-to-many relationships - A many-to-many
relationship is accomplished by creating a "join" or "lookup" table between two
other tables. For example, if a **Product** can have many **Tag**s, any given
**Tag** can also have many **Product**s that it is attached to. A database
diagram for this relationship could look like:

```
┌───────────┐     ┌─────────────────┐      ┌───────────┐
│  Product  │     │  ProductsOnTag  │      │    Tag    │
├───────────┤     ├─────────────────┤      ├───────────┤
│ id        │────<│ productId       │   ┌──│ id        │
│ title     │     │ tagId           │>──┘  │ name      │
│ desc      │     └─────────────────┘      └───────────┘
└───────────┘
```

The `schema.prisma` syntax to create this relationship looks like:

```javascript
model Product {
  id       Int    @id @default(autoincrement())
  title    String
  desc     String
  tags     Tag[]
}

model Tag {
  id       Int     @id @default(autoincrement())
  name     String
  products Product[]
}
```

These relationships can be [implicit](https://www.prisma.io/docs/concepts/components/prisma-schema/relations#implicit-many-to-many-relations) (as this diagram shows) or [explicit](https://www.prisma.io/docs/concepts/components/prisma-schema/relations#explicit-many-to-many-relations) (explained below). Redwood's SDL generator (which is also used by the scaffold generator) only supports an **explicit** many-to-many relationship when generating with the `--crud` flag. What's up with that?

## CRUD Requires an `@id`

CRUD (Create, Retrieve, Update, Delete) actions in Redwood currently require a single, unique field in order to retrieve, update or delete a record. Generally this is an `id` column. It doesn't have to be named `id`, but needs to be a column denoted with Prisma's `@id` syntax which marks it as a primary key in the database. This field is guaranteed to be unique and so can be used to find one specific record.

Prisma's implicit many-to-many relationship syntax creates a table _without_ a column marked as an `@id`. It uses confusingly similar token `@@id` which just creates a unique _index_ on the two columns that are foreign keys to the two tables that are being joined. The diagram above shows the result of letting Prisma create an implicit relationship.

Since there's no `id` column here, you can't use the SDL generator with the `--crud` flag. Likewise, you can't use the scaffold generator, which uses the SDL generator (with `--crud`) behind the scenes.

## Supported Table Structure

To support both CRUD actions and to remain consistent with Prisma's m-n-relationships, a combination of [`@id`](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference#id) and [`@@unique`](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference#unique-1) can be used. With this, `@id` is used to create a primary key on the lookup-table and `@@unique` is used to maintain its unique index, which was previously accomplished by the primary key created with `@@id`.

You can get this working by creating an explicit relationship—defining the table structure yourself:

```javascript
model Product {
  id       Int      @id @default(autoincrement())
  title    String
  desc     String
  tags     Tag[]
}

model Tag {
  id       Int       @id @default(autoincrement())
  name     String
  products Product[]
}

model ProductsOnTags {
  id        Int       @id @default(autoincrement())
  tagId     Int
  tags      Tag[]     @relation(fields: [tagId], references: [id])
  productId Int
  products  Product[] @relation(fields: [productId], references: [id])
  @@unique([tagId, productId])
}
```

Which creates a table structure like:

```
┌───────────┐      ┌──────────────────┐     ┌───────────┐
│  Product  │      │  ProductsOnTags  │     │    Tag    │
├───────────┤      ├──────────────────┤     ├───────────┤
│ id        │──┐   │ id               │  ┌──│ id        │
│ title     │  └──<│ productId        │  │  │ name      │
│ desc      │      │ tagId            │>─┘  └───────────┘
└───────────┘      └──────────────────┘

```

Almost identical! But now there's an `id` and the SDL/scaffold generators will work as expected. The explicit syntax gives you a couple additional benefits—you can customize the table name and even add more fields. Maybe you want to track which user tagged a product—add a `userId` column to `ProductsOnTags` and now you know.
