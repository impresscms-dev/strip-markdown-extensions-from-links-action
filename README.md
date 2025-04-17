
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
          # Optional: Ignore specific links in specific files
          ignore-filter: |
            # Ignore all markdown links in README.md
            *.md: README.md
            # Ignore links to API.md in all documentation files
            API.md: docs/**/*.md

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
| ignore-filter | No | | Pattern-based filter to ignore specific links in specific files. Uses YAML format where keys are link patterns and values are file patterns. Both sides accept glob syntax. |

### Using the path parameter

The `path` parameter specifies the directory containing Markdown files that need to be processed. This action will recursively search for all Markdown files in the specified directory and its subdirectories.

#### Basic Usage

```yaml
path: ./docs/
```

#### Examples

##### Process files in the root directory

```yaml
path: ./
```

##### Process files in a specific documentation directory

```yaml
path: ./documentation/
```

##### Process files in multiple directories

If you need to process files in multiple directories, you can run the action multiple times with different paths:

```yaml
- name: Process main documentation
  uses: impresscms-dev/strip-markdown-extensions-from-links-action@v1.2.0
  with:
    path: ./docs/

- name: Process API documentation
  uses: impresscms-dev/strip-markdown-extensions-from-links-action@v1.2.0
  with:
    path: ./api-docs/
```

#### Important Notes

- The path is relative to the repository root
- The action processes all Markdown files (`.md`) in the specified directory and its subdirectories
- If a file is not a valid Markdown file, it will be skipped
- The action modifies files in-place, so make sure to commit or back up your files if needed

### Using the ignore-filter parameter

The `ignore-filter` parameter allows you to selectively ignore specific links in specific files. This is useful when you want to exclude certain files or links from being processed.

#### Basic Format

The parameter uses YAML format where:
- **Keys** are glob patterns matching the links you want to ignore
- **Values** are glob patterns matching the files where these links should be ignored

#### Examples

##### Ignore all markdown links in README.md

```yaml
ignore-filter: |
  *.md: README.md
```

##### Ignore specific links in specific files

```yaml
ignore-filter: |
  # Ignore links to API.md in all files
  API.md: "*"

  # Ignore all markdown links in tutorial files
  *.md: "**/tutorials/*.md"
```

##### Using arrays for multiple file patterns

```yaml
ignore-filter: |
  *.md:
    - README.md
    - CONTRIBUTING.md
  docs/*.md: reference/**/*.md
```

#### Important Notes

- Both link patterns and file patterns support glob syntax
- The patterns `*:*` and `*.md:*.md` are not allowed as they would make the action ineffective
- File paths are relative to the `path` parameter
- If a link matches multiple patterns, it will be ignored if any of the patterns match

## How to contribute?

If you want to add functionality or fix bugs, you can fork the repository, make your changes, and create a pull request. If you're not sure how this works, check out the [GitHub documentation on creating a pull request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request).

If you find any bugs or have questions, please use the [issues tab](https://github.com/impresscms-dev/strip-markdown-extensions-from-links-action/issues) to report them.
