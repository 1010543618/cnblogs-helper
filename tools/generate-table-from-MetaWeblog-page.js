/**
 * 从 cnblogs 的 MetaWeblog API 构建sqllite的表 
 * 
 * cnblogs 的 MetaWeblog API ： 
 *   [MetaWeblog](https://rpc.cnblogs.com/metaweblog/jffun-blog#BlogInfo)
 */

const map = {
  string: 'TEXT',
  any: 'TEXT',
  integer: 'INTEGER',
  base64: 'BLOB'
}

let sql = "";

document.querySelectorAll("#content > table").forEach((t) => {
  sql += `CREATE TABLE ${t.previousElementSibling.querySelector("a").innerText.split(' ')[1]} (\n`;
  t.querySelectorAll("tr").forEach((tr)=>{
    let td = tr.querySelectorAll("td");
    sql += `  ${td[1].innerText.split(' ')[0]} ${map[td[0].innerText] || td[0].innerText},\n`;
  })
  sql += ');\n';
});

console.log(sql);