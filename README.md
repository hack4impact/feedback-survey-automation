<p align="center"><img alt="Icon" width="200" src="https://raw.githubusercontent.com/YashTotale/airtable-automation/main/static/images/icon.png"></img></p>

<h1 align="center">Airtable Automation</h1>

<p align="center">
<a href="https://github.com/YashTotale/airtable-automation/actions?query=workflow%3A%22Automated+Run%22"><img alt="Automated Run Badge" src="https://img.shields.io/github/workflow/status/YashTotale/airtable-automation/Automated%20Run?style=flat-square&labelColor=000000&logo=github&logoColor=FFFFFF&label=Automated%20Run"></img></a>
<a href="https://github.com/YashTotale/airtable-automation/actions?query=workflow%3A%22Node+CI%22"><img alt="Node CI Badge" src="https://img.shields.io/github/workflow/status/YashTotale/airtable-automation/Node%20CI?style=flat-square&labelColor=000000&logo=github&logoColor=FFFFFF&label=Node%20CI"></img></a>
</p>

## Contents <!-- omit in toc -->

- [Guide to Running Locally](#guide-to-running-locally)
  - [Required Technologies](#required-technologies)
  - [Checkout Repository](#checkout-repository)
  - [Install Dependencies](#install-dependencies)
  - [Set up Secret Files](#set-up-secret-files)
  - [Compile project](#compile-project)
  - [Run](#run)
- [Guide to Developing Locally](#guide-to-developing-locally)
  - [Set up Clasp](#set-up-clasp)
- [Tools & Technologies](#tools--technologies)
  - [TypeScript](#typescript)
  - [Airtable API](#airtable-api)
  - [Apps Script](#apps-script)
  - [Nodemailer](#nodemailer)
  - [Linters](#linters)
  - [GitHub Actions](#github-actions)

## Guide to Running Locally

### Required Technologies

- [Git], version `>=2.x`
- [Node.JS], version `>=15.x`
- [NPM], version `>=6.x`

### Checkout Repository

```shell
git clone https://github.com/YashTotale/airtable-automation.git
cd airtable-automation
```

### Install Dependencies

```shell
npm install
```

### Set up Secret Files

- Login to Google Drive with avhack4impact@gmail.com
- Navigate to the ['Secret Files' folder] in the 'Airtable Automation' folder in Drive
- Copy Files:
  - `.env` file to your root folder
  - `serviceaccount.json` file to `src/Config/serviceaccount.json`

### Compile project

```shell
npm run compile
```

### Run

```shell
npm run make
```

## Guide to Developing Locally

**FOLLOW ALL ['Guide to Running Locally'](#guide-to-running-locally) STEPS FIRST**

### Set up Clasp

```shell
npm run clasp:login
```

- This will redirect to a Google Sign in screen. Sign in with avhack4impact@gmail.com
- Click 'Allow' to allow all permissions
- To confirm that you're logged in:

  ```shell
  npm run clasp:status
  ```

## Tools & Technologies

### TypeScript

We use [TypeScript] to add type checking to make our code more robust and maintainable.

### Airtable API

We use the [Airtable NPM package] to read, write, and update data on the Hack4Impact Project Success Airtable.

### Apps Script

We use [Google Apps Scripts] to create Google Forms (as there is no Google Forms API for Node.JS) and update the Airtable data when a form is submitted. Additionally, we use [clasp] to develop our Apps Scripts locally.

### Nodemailer

We use the [Nodemailer NPM package] to send feedback survey emails to nonprofits.

### Linters

We use [Prettier], [ESLint], [MarkdownLint], and [EditorConfig] to ensure our code style is uniform throughout the project. These tools also help us avoid [Technical Debt] in our code and increase maintainability.

We also use [Husky] and [Lint-Staged] to run our linters and formatters on all staged files before every commit.

### GitHub Actions

We use [GitHub Actions] as our [CI/CD pipeline]. We check for lint & build errors, and push the latest versions of our Apps Scripts every time a push is made to the `main` branch.

Additionally, every day at 11:30 PST, we run our script with a [scheduled GitHub Action].

<!-- Reference Links -->

[git]: https://git-scm.com/
[node.js]: https://nodejs.org/en/
[npm]: https://www.npmjs.com/
['secret files' folder]: https://drive.google.com/drive/folders/1kcdNls8krOBnIpDNls-hBxsc3yjfPiiB
[typescript]: https://www.typescriptlang.org/
[airtable npm package]: https://www.npmjs.com/package/airtable
[google apps scripts]: https://developers.google.com/apps-script
[clasp]: https://developers.google.com/apps-script/guides/clasp
[nodemailer npm package]: https://nodemailer.com/about/
[prettier]: https://prettier.io/
[eslint]: https://eslint.org/
[markdownlint]: https://github.com/DavidAnson/markdownlint
[editorconfig]: https://editorconfig.org/
[husky]: https://typicode.github.io/husky/#/
[lint-staged]: https://github.com/okonet/lint-staged
[technical debt]: https://www.productplan.com/glossary/technical-debt/
[github actions]: https://github.com/features/actions
[ci/cd pipeline]: https://semaphoreci.com/blog/cicd-pipeline
[scheduled github action]: https://docs.github.com/en/actions/reference/events-that-trigger-workflows#scheduled-events
