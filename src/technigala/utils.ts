import fs from 'fs'

export const createFile = async (name: string, theMap: Map<string, string>) => {
  // create a file called ${name}.ts

  fs.writeFile(
    `./src/technigala/maps/${name}.ts`,
    `export const ${name}Map = new Map<string, string>([\n${Array.from(
      theMap.entries()
    )
      .map(([key, value]) => `  ["${key}", "${value}"]`)
      .join(',\n')}\n])`,

    (err) => {
      if (err) {
        console.log(err)
      }
    }
  )
}
