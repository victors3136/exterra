npm run build
aws s3 sync dist/ s3://gccc-radar-map-frontend-2026 --delete --region eu-north-1
