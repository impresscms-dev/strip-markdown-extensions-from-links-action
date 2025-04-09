
[![License](https://img.shields.io/github/license/impresscms-dev/strip-markdown-extensions-from-links-action.svg)](LICENSE)
[![GitHub release](https://img.shields.io/github/release/impresscms-dev/strip-markdown-extensions-from-links-action.svg)](https://github.com/impresscms-dev/strip-markdown-extensions-from-links-action/releases)

# Strip MarkDown extensions from links action

GitHub action to strip Markdown file extensions from links (useful for making links work with GitHub wiki and other platforms that don't support .md extensions in links).

### Use Cases

- **GitHub Wiki**: Prepare documentation for GitHub Wiki where .md extensions are not used in URLs
- **Documentation Sites**: Many documentation generators prefer links without file extensions
- **Static Site Generators**: When converting Markdown to HTML, clean URLs without extensions are often preferred
- **Cross-Platform Compatibility**: Ensures links work consistently across different Markdown renderers

## Usage

To use this action in your project, create a workflow in your project similar to this code (Note: some parts and arguments may need to be altered for your specific use case):
```yaml
name: Generate documentation

on:
  push:

jobs:
  get_php_classes_list:
    runs-on: ubuntu-latest
    steps:
      - name: Checkouting project code...
        uses: actions/checkout@v4

      - name: Install PHP
        uses: shivammathur/setup-php@master
        with:
          php-version: 8.1
          extensions: curl, gd, pdo_mysql, json, mbstring, pcre, session
          ini-values: post_max_size=256M
          coverage: none
          tools: composer:v2

      - name: Install Composer dependencies (with dev)
        run: composer install --no-progress --no-suggest --prefer-dist --optimize-autoloader

      - name: Generating documentation...
        uses: impresscms-dev/generate-phpdocs-with-clean-phpdoc-md-action@v0.1.4
        with:
          class_root_namespace: ImpressCMS\
          included_classes: ImpressCMS\**
          output_path: ./docs/

      - name: Stripping file extensions...
        uses: impresscms-dev/strip-markdown-extensions-from-links-action@v1.2.0
        with:
          path: ./docs/

      - uses: actions/upload-artifact@v4
        with:
          name: my-artifact
          path: ./docs/
```

## Arguments

This action supports the following arguments (used with the `with` keyword):

| Argument    | Required | Default value        | Description                       |
|-------------|----------|----------------------|-----------------------------------|
| path | Yes      |                      | Folder containing Markdown files whose links need to be processed |

## How to contribute?

If you want to add functionality or fix bugs, you can fork the repository, make your changes, and create a pull request. If you're not sure how this works, check out the [GitHub documentation on creating a pull request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request).

If you find any bugs or have questions, please use the [issues tab](https://github.com/impresscms-dev/strip-markdown-extensions-from-links-action/issues) to report them.
