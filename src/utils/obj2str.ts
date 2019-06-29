export default function(obj) {
    return Object.entries(obj).map(d => `${d[0]}: ${d[1]}`).join(',')
}