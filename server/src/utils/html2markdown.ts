export function html2markdown(str: string): string {
  // <a> hyper link
  str = str.replace(/<a .*?href="(.+?)".*?>(.+?)<\/ *a>/gmi, "[$2]($1)");

  // <i> italics
  str = str.replace(/<i.*?>(.*?)<\/ *i>/gmi, "*$1*");

  // <b> bold
  str = str.replace(/<b.*?>(.*?)<\/ *b>/gmi, "**$1**");

  // <ul><li> list
  for (let matched = /<ul.*?>(.+)<\/ *ul>/gi.exec(str); matched; matched = /<ul.*?>(.+)<\/ *ul>/gi.exec(str)) {
    str = str.replace(matched[0], matched[1].replace(/(<li.*?>)/gmi, "  $1"));
  }
  str = str.replace(/<li.*?>/gmi, "- ");
  str = str.replace(/<\/ *li>/gmi, "\n");

  // <div>
  for (let temp = str.replace(/<div.*?>(.+)<\/ *div>/gmi, "$1\n\n"); temp.length < str.length; temp = str.replace(/<div.*?>(.+)<\/ *div>/gmi, "$1\n\n")) {
    str = temp;
  }

  // unknown tag
  str = str.replace(/<[^>|u|\/ *u]*>/gmi, "");

  return str;
}
