ArkSDK
===============

##  API

### Querying API

JSON POST queries sent to endpoint `/search` will expanded into ES query format.

Example:

The posted JSON :
`{ "query" : {"type" : "email", "data" : { "email" : "newsletter@springwise.com" }}}`

The expanded query :
`{ "term" : { "emails.email" : { "term" : "newsletter@springwise.com"}}}`

Queries can also be combined like this:

```json
  {
    "query" : [
      {"type" : "email", "data" : { "email" : "newsletter@springwise.com" }},
      {"type" : "full_name_exact", "data" : { "fullName" : "Alex" }}
    ]
  }
```

#### Specific queries

##### Search by email

```json
{ "query" : {"type" : "email", "data" : { "email" : "newsletter@springwise.com" }}}
```

#### Broadcast queries

In order to issue a broadcast query (no ongoing merge will be completed in case we have multiple unmerged profiles with similar data) - we must query `POST /api/1/search` endpoint with the following body:

Every query can support multiple statements, default searching mode is "should" with at least 1 query giving positive results. The better the match is - the higher it will be scored.

##### Search by network + id

```json
{ "query": [{ "type": "network_id", "data": { "network": "Facebook", "network_id": "jordiaragones" }}] }
```

##### Search by place

```json
{ "query" : [{ "type": "places", "data": { "place": "San Francisco" }}] }
```

##### Search by gender, currently supports "male", "female" and "other"

**currently broken**

In the future aliases like "f", "m", "o" will be supported

```json
{ "query" : [{ "type": "sex", "data": { "sex": "female" }}] }
```

##### Search by language, currently supports 2 letter notations like "en", "ru", "sp"

 In the future aliases will be added like english -> eng -> en, etc

```json
{ "query" : [{ "type": "languages", "data": { "language": "en" }}] }
```

##### Search by fullName exact match
```json
{ "query" : [{"type" : "full_name_exact", "data" : { "fullName" : "Alex" }}] }
```

##### Search by fullName, allowing partial match

```json
{ "query" : [{"type" : "full_name_partial_translit", "data" : { "fullName" : "Ale" }}] }
```

##### Search by education

* `school` and/or `degree` should be specified
* `start` and/or `end` fields are optional

```json
{ "query" : [{ "type" : "education", "data" : { "school" : "standford", "start" : "2013", "degree": "computer science"  }}] }
```

##### Search by work experience

* `title` and/or `company` should be specified
* `start` and/or `end` fields are optional

##### Search for people who ever worked at `ark` and hold the position of a `product manager`

```json
{ "query" : [{ "type": "experience", "data": { "company": "ark", "title": "product manager" }}] }
```

##### Search for people who ever worked at `ark`

```json
{ "query" : [{ "type": "experience", "data": { "company": "ark" }}] }
```

##### Search for people who ever worked at `ark` and had a position of a `product manager` in the career history in any company

```json
{
  "query" : [
    { "type": "experience", "data": { "company": "ark" }},
    { "type": "experience", "data": { "title": "product manager" }}
  ]
}
```

##### Search by interests

Currently supports exact matches only, tag-like system. Will be updated with more fuzziness in the future

Allowed types: `ALLOWED_INTEREST_TYPES: ['books', 'film', 'games', 'movies', 'music', 'other']`

```json
{
  "query": [
    { "type": "interests", "data": { "text": "Y Combinator", "type": "other" } }
  ]
}
```

```json
{
  "query": [
    { "type": "interests", "data": { "text": "Game Development", "type": "other" } }
  ]
}
```

