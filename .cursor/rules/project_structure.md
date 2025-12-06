---
applyTo: "**"
---

# Rules for Modular Code in Cursor

## Context

These rules are designed for teams working with **Next.js** using **Screaming Architecture**, prioritizing domain‑driven naming and highly cohesive modules.

## Principles of Modularity

* **High cohesion**: Each module must fulfill a clearly defined domain purpose.
* **Low coupling**: Avoid unnecessary dependencies between modules.
* **Single Responsibility**: Each file should have only one reason to change.
* **Explicit interfaces**: Only expose what other modules need.
* **No circular dependencies**: Architecture must scale without blocking.

## Screaming Architecture in Next.js

> The folder structure should "scream" the business domain, not the framework.

### Domain‑Driven Organization

```
src/
  (domain)/
    application/
    domain/
    infrastructure/
    ui/
```

Example:

```
src/
  auth/
    domain/
    application/
    infrastructure/
    ui/
  payments/
    domain/
    application/
    infrastructure/
    ui/
```

### Layer Rules

| Layer          | What it contains                        | Can depend on        |
| -------------- | --------------------------------------- | -------------------- |
| domain         | entities, value objects, business rules | none (pure layer)    |
| application    | use cases, services                     | domain               |
| infrastructure | data access, Supabase, external APIs    | application & domain |
| ui             | Next.js/React components                | application          |

## Naming Conventions

* **Domain‑oriented naming**, not framework‑oriented

  * ✔️ `User`, `Login`, `Invoice`
  * ❌ `components`, `utils`, `hooks` as root folders
* Files reflect their role: `*.service.ts`, `*.usecase.ts`, `*.entity.ts`
* Avoid generic folders like `helpers/`, `common/` without a clear domain

## UI Components Rules

* UI components handle **presentation and events only**
* **Business logic never lives in UI**
* Reuse types from `domain/` or `application/`
* Use an `index.ts` to expose each module’s public API

## Supabase Integration

> Supabase belongs strictly to **infrastructure**, never to domain or UI.

### Folder Organization

```
src/
  (domain)/
    infrastructure/
      supabase/
        queries.ts
        mutations.ts
        mapper.ts
```

### Data Access Rules

* Only **infrastructure** interacts with Supabase
* Application layer triggers use cases that **call infrastructure functions**
* Domain **must not know** Supabase exists

Valid dependency direction:
UI → Application → Domain → Infrastructure → Supabase

### Queries & Mutations

* Separate **read** and **write** operations into different files
* Avoid heavy transformations inside queries: use **mappers** to convert data into domain entities

### Row Level Security & Policies

* **Security rules live in Supabase**, never in code
* Domain/application may complement authorization, but not replace DB enforcement

### Types

* Supabase‑generated types are used **only in infrastructure**
* Domain must model **its own entities**, independent of DB schema

---

* All persistence logic goes into `infrastructure/`
* Use cases orchestrate logic and never talk to Supabase directly
* Do not leak Supabase details to higher layers

## Modular Testing

* Unit tests must live next to the tested module

```
feature/
  domain/
    user.entity.test.ts
```

* Mock only lower‑level dependencies
* Dependency validation: Domain ≥ Application ≥ Infrastructure ≥ UI

## Anti‑Patterns (Forbidden)

* Importing UI from domain or application
* Importing Supabase directly in UI or domain
* Large modules with multiple responsibilities
* Global utils without domain context

## Commit Checklist

* [ ] Does the module name reflect the domain?
* [ ] Is logic placed in the correct layer?
* [ ] No invalid cross‑layer dependencies?
* [ ] Does each file have a single responsibility?
* [ ] Did I add unit tests if required?
