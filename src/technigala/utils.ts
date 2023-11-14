import fs from 'fs'

export const createFile = async (name: string, theMap: Map<string, string>) => {
  // create a file called ${name}.ts

  fs.writeFile(
    `./src/technigala/maps/${name}.ts`,
    `export const ${name}Map = {
  ${Array.from(theMap).map(([key, value]) => `  "${key}": "${value}"`)})`,
    (err) => {
      if (err) {
        console.log(err)
      }
    }
  )
}

export const createTopicVideoFile = async (
  name: string,
  theMap: Map<string, string[]>
) => {
  // create a file called ${name}.ts

  fs.writeFile(
    `./src/technigala/maps/${name}.ts`,
    `export const ${name}Map = {
  ${Array.from(theMap).map(
    ([key, value]) => `  "${key}": ${JSON.stringify(value)}`
  )}}`,
    (err) => {
      if (err) {
        console.log(err)
      }
    }
  )
}
