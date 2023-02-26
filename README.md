# workflows-static-site

## Hugo

For hugo projects there are two workflows to add to your project.

### build.yml

```yaml
name: Build

on:
  push:
    branches:
      - main
  pull_request:

concurrency:
  group: ${{ github.workflow }}-${{ github.head_ref || github.run_id }}
  cancel-in-progress: true

jobs:
  hugo:
    uses: gauntface/workflows-static-site/.github/workflows/hugo.yaml@main
    secrets:
      AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
      AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

### publish.yml

```yaml
name: Publish

# Run every Sunday @ 03:00 UTC
on:
  workflow_dispatch:
  schedule:
    - cron: "0 3 * * 0"

jobs:
  hugo:
    uses: gauntface/workflows-static-site/.github/workflows/hugo.yaml@main
    secrets:
      AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
      AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    with:
      deploy: true
      s3_bucket_name: <S3 Bucket Name Here>
```
