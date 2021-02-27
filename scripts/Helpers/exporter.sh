set -e

do-export() {
  export $(cat .env | xargs)
}

if [ $# -eq 0 ]; then
  do-export && return
fi

for i in "$@"; do
  if [ -z ${!i+x} ]; then do-export && return; fi
done
