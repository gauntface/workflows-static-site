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

# Test
jobs:
  workflows:
    uses: gauntface/workflows-static-site/.github/workflows/hugo-build.yaml@main
    secrets:
      AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
      AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

### publish.yml

```yaml
name: Publish

# Run every Sunday @ 03:00 UTC => 20:00 PST
on:
  workflow_dispatch:
  schedule:
    - cron:  '0 3 * * 0'

# Test
jobs:
  workflows:
    uses: gauntface/workflows-static-site/.github/workflows/hugo-deploy.yaml@main
    secrets:
      AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
      AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    with:
      S3_BUCKET_NAME: www.miniworks.club
```
