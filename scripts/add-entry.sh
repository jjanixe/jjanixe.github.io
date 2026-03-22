#!/bin/bash
# Usage: ./scripts/add-entry.sh <section> <filename>
# Example: ./scripts/add-entry.sh publications 2025-my-paper

SECTION="$1"
FILENAME="$2"

if [ -z "$SECTION" ] || [ -z "$FILENAME" ]; then
  echo "Usage: $0 <section> <filename>"
  echo "Sections: publications, research, teaching, reviewer"
  exit 1
fi

DIR="data/${SECTION}"
TEMPLATE="${DIR}/_template.yaml"
INDEX="${DIR}/_index.yaml"
TARGET="${DIR}/${FILENAME}.yaml"

if [ ! -f "$TEMPLATE" ]; then
  echo "Error: Template not found at ${TEMPLATE}"
  exit 1
fi

if [ -f "$TARGET" ]; then
  echo "Error: ${TARGET} already exists"
  exit 1
fi

cp "$TEMPLATE" "$TARGET"
echo "- ${FILENAME}.yaml" >> "$INDEX"

echo "Created ${TARGET}"
echo "Updated ${INDEX}"
echo "Open ${TARGET} to edit your new entry."
