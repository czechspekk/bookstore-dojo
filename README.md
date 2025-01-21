# Bookstore - Typescript + Express

This project implements functional requirements for basic Bookstore with simple JWT based authentication to allow books management for authenticated authors.



## Running on local machine
Prerequisities:

    Node(22) ideally via nvm

Clone this repository and run the following commands
    
    cp .env.template .env
    npm install && npm run build
    npm start

##  Discover API Endpoints

Navigate to http://localhost:8080/docs to explore Swagger API documentation for all endpoints.
There are 2 users available for Author
`username` / `password`

`john-doe` / `YAY`
`darth-vader` / `darth-vader`

# Decisions made on the way

## Boilerplate
After short research I found https://github.com/edwinhern/express-typescript-2024 and it fit into what I needed, not bloated with many layers of abstraction, yet provided simple API module structure with all needed bits and bobs to get the whole project quickly up and running.

## Project structure

Adopted from the boilerplate, each API module consists of

> /src/api/module

*Model*- Schemas + Types
*Router* - connected to top level API paths, defines subroutes and connects to controller, defines schema validations for requests
*Controller*- deals with variable extraction from request and handles ServiceResponse
*Service* -  Deals with most of the logic required to process entities, orchestrates needed actions and returns ServiceResponse back to Controller 
*Repository*- Deals with stored records - **simple InMemory implementation** is used for simplicity of the DOJO

> /src/common/middleware/

*auth.ts* - Wrapper around [Express-jwt](https://www.npmjs.com/package/express-jwt) middleware 
				Further improvements could be done on the jwt layer - but this was not really the scope of the test
errorHandler.ts - Common error handler for various errors

## API functionality



Property `AuthorId` represents user who owns the book and is allowed to manage this book, the full user record carries authorName and potentially additional properties
Published book - book record with `published: true` property.

### Publishing / unpublishing of books
The provided functionality requirements didn't specify what publishing exactly means, however based on the general content editing industry standards, no content is immediately published to audiences without certain verification, quality assurance, moderation etc.

In normal development process there would be several discussion rounds to discuss the requirements and adjust the wording to industry standards and security concerns. As all this test was done in complete isolation, I decided for default value of property `published `to be `false`and therefore allow Draft books that needs to be published to become available in the public /bookstore/.

This property can be passe on Book creation and allow direct publishing, on PATCH or within PUT request.
**Darth Vader is not allowed to Publish, but he's allowed to create books and keep them not published**

Unpublishing can be done via PATCH / PUT setting `published` to `false` - this allows for softer approach than hard DELETE.

Hard DELETE is also implemented, but that is **very destructive operation** - in most of my life I avoided implementing HARD Delete but replaced with SOFT Delete (deleted: true). 

### Quick overview of the High level routes 
You can find full details at http://localhost:8080/docs

*/bookstore/* - Publicly accessible part of the API - `authorId` and `title` can be used for search with queryParams
*/auth/* -  Allows for Authentication username/password 
*/books/* - Author owned books management API - requires JWT token from /auth - `authorId` and `title` can be used for search with queryParams
*/users/* - Users collection - only Collection and single resource are implemented

## Authentication

**In the era of SSO, OAuth providers and security breaches, building simple username/password based auth might not be the most ideal way of doing things.**

Therefore I chose the simplest and **definitely not production ready approach** - plain text passwords stored in memory runtime (at this point also in the codebase YAY!)

However, I expected that the scope of this test to see how one can put all the pieces together, not about getting every aspect of the application worked into production ready details.

Using [Passport](https://www.passportjs.org/) module helped me in previous projects with high complexity.

## Endpoint tests

I covered all Book endpoints with the Happy path tests, some of the unhappy paths are not covered at this point, some are. 
In general, these tests are full end to end integration tests and provide a great top level safety net.

Further Unit tests would need to be added to cover: Model, Service, Controller & Repository

## Disallowing certain books 

Moderation can be done in many ways, I decided for generic property based match that would allow for any kind of moderation if required.
Currently it is implentend with full match on given property, but this could be extended to support custom comparison operators etc.
