/**
 진행순서
    parseXmi -> makeTree -> insertChlid(재귀호출) -> arrangeTree
    -> makeTable -> makeTr(재귀호출), appendTd(재귀호출)
 */
var DEBUG = false;
/* input file names : var fialArr1, fileArr2 */
var fileArr1 = [
	"jc_sp_02_004.xmi"
    ,"jc_sp_02_014.xmi"
    ,"jc_sp_02_020.xmi"
    ,"jc_sp_02_027.xmi"
	,"jc_sp_02_027-orig.xmi"
    ,"jc_sp_02_036.xmi"
    ,"jc_sp_02_037.xmi"
	,"jc_sp_02_037-orig.xmi"
    ,"jc_sp_02_038.xmi"
    ,"jc_sp_02_042.xmi"
    ,"jc_sp_02_043.xmi"
    ,"jc_sp_02_052.xmi"
    ,"jc_sp_02_061.xmi"
    ,"jc_sp_02_063.xmi"
    ,"jc_sp_02_067.xmi"
    ,"jc_sp_02_068.xmi"
	,"jc_sp_02_068-orig.xmi"
    ,"jc_sp_02_069.xmi"
    ,"jc_sp_02_078.xmi"
    ,"jc_sp_02_083.xmi"
    ,"jc_sp_02_084.xmi"
	,"jc_sp_02_084-orig.xmi"
];

var fileArr2 = [
	"1.xmi"
    ,"3.xmi"
    ,"4.xmi"
    ,"5.xmi"
    ,"6.xmi"
    ,"7.xmi"
    ,"8.xmi"
    ,"9.xmi"
    ,"10.xmi"
    ,"11.xmi"
    ,"12.xmi"
    ,"13.xmi"
	,"14.xmi"
	,"20190227-problematic/jc_sp_02_004a.xmi"
	,"20190227-problematic/jc_sp_02_014r.xmi"
	,"20190227-problematic/jc_sp_02_020a.xmi"
	,"20190227-problematic/jc_sp_02_027a.xmi"
	,"20190227-problematic/jc_sp_02_068.xmi"
	,"20190227-problematic/jc_sp_02_081a.xmi"
	,"20190227-problematic/troublemaker3-2-2.xmi"
];

var maxSpan = 0;
$(document).ready(function() {
    var option = "";
    for (var i = 0; i < fileArr1.length; i++) {
        option += "<option value=\"" + fileArr1[i] + "\">" + fileArr1[i] + "</option>";
    }
    $("#xmi1").html(option);
    
    changeXmi($("#xmi1").val(), '1');
    
    option = "";
    for (var i = 0; i < fileArr2.length; i++) {
        option += "<option value=\"" + fileArr2[i] + "\">" + fileArr2[i] + "</option>";
    }
    $("#xmi2").html(option);
    
    changeXmi($("#xmi2").val(), '2');
    
});

function changeXmi(file, dvs) {
    exceptId = "";
    level1End = 0;
    escapeRoot = false;
    
    $("#demo" + dvs).html("");
    $("#body" + dvs).html("");
    $.ajax({
        type: "POST",
        url: "/XMI" + dvs + "/" + file,
        data: {},
        dataType: "text",
        success: function(xmi) {
            var tree = parseXmi(xmi, dvs);

            tree = arrangeTree(tree);
            console.log(tree);
            makeTable(tree, dvs);

            $("#body" + dvs + " table").each(function() {
                var start = true;
                
                // 좌->우(↘) 형태(=true)인지 아닌 좌<-우(↙) 형태(=false)인지 확인
                var firstTdArr = $(this).find("tr td:first-child");
                var rightTree = false;
                for (var i = 0; i < firstTdArr.length; i++) {
                    var type = $(firstTdArr[i]).attr("type");
                    if (type === "blank") {
                        rightTree = true;
                        break;
                    }
                };

                var lastTdArr = $(this).find("tr td:last-child");
                for (var i = lastTdArr.length - 1; i >= 0; i--) {
                    var firstTd = firstTdArr[i];
                    if (!rightTree && $(firstTd).attr("id") !== "node_0") {
                        continue;
                    }
                    
                    var lastTd = lastTdArr[i];
                    var sumSpan = 0;
                    var $tr = $(lastTd).parent("tr");
                    $tr.find("td").each(function() {
                        var span = $(this).attr("colspan");
                        if (typeof span === "undefined") {
                            sumSpan++;
                        } else {
                            sumSpan += parseInt(span) > 0 ? parseInt(span) : 1;
                        }
                    });

                    var lastSpan = parseInt($(lastTd).attr("colspan"));
                    $(lastTd).attr("colspan", lastSpan + maxSpan - sumSpan);
                }
            });
            
        }
    });
}

function parseXmi(xmi, dvs) {
    var parser = new DOMParser();
    xml = parser.parseFromString(xmi, "text/xml");

    var sofaStr = (xml.getElementsByTagName('cas:Sofa')[0]).getAttribute('sofaString');
    $("#demo" + dvs).html(sofaStr);
    
    var chunk = xml.getElementsByTagName('custom:JuziChengfen');
    var len = chunk.length;
    var arr = [];
    
    for (var i = 0; i < len; i++) {
        var obj = chunk[i];
        var begin = parseInt(obj.getAttribute("begin"));
        var end = parseInt(obj.getAttribute("end"));
        var tag = obj.getAttribute("JuziChengfen_tags");
        
        if (typeof begin === "undefined") {
            begin = 0;
        }
        
        var txt = "";
        for (var j = begin; j < end; j++) {
            txt += sofaStr[j];
        }
        
        arr[i] = {
            "id" : 'node_' + i + ''
            ,"level" : 1
            ,"begin" : begin
            ,"end" : end
            ,"txt" : txt
            ,"tag" : tag
            ,"htmlDvs" : ""
            ,"child" : []
        }
    }
    console.log(arr);
    
    return makeTree(arr);
}

// 각 node.child에서 undefined 빼기위해서 수행
function arrangeTree(tree) {
    var len = tree.length;
    var ret = [];
    for (var i = 0; i < len; i++) {
        var node = tree[i];
        if (node == null) {
            continue;
        }
        ret.push(node);

        if (node.child.length > 0) {
            node.child = arrangeTree(node.child);
        }
    }

    return ret;
}

// 노드 중복입력 방지용
var exceptId = "";
// level1 노드가 붙어있는게 아니고 떨어져 있는 경우 때문에 처리
var level1End = 0;

// 실제 트리 생성
function makeTree(arr) {
    var tree = [];
    
    var len = arr.length;
    var prevNode = null;
    var prevKey = 0;
    for (var i = 0; i < len; i++) {
        var node = arr[i];
        
        if (i === 0) {
            level1End = node.end;
            tree.push(node);
            prevNode = node;
            continue;
        }
        
        if (exceptId.indexOf('[' + node.id + ']') > -1) {
            continue;
        }
        
        escapeRoot = false;

        // case0 최상위 시작부분
        if (prevNode.end + 1 === node.begin) {
            level1End = node.end;
            tree.push(node);
        } else if (level1End + 1 === node.begin) {
            // level1인데 붙어있는게 아니고 떨어져 있는 경우 때문에 추가
            level1End = node.end;
            tree.push(node);
        } else if (prevNode.begin === node.begin) {
            var tmpArr = arr.slice(i, len);
            insertChlid(2, tmpArr, prevNode);
        }
        
        if (prevNode !== node) {
            prevNode = node;
            prevKey = i;
        }
    }
    
    console.log("-----------------------------------------");
    return tree;
}

var escapeRoot = false;
function insertChlid(level, arr, parent) {
console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", level, "start");
    var len = arr.length;
    var prevNode = null;
    var prevKey = 0;
    for (var i = 0; i < len; i++) {
        var node = arr[i];

        if (exceptId.indexOf('[' + node.id + ']') > -1) {
            continue;
        }
        
        console.log(i, node.id, node.level, node.begin, node.end, node.txt);
        
        if (node.tag.indexOf('!') > -1) {
            escapeRoot = true;
            return null;
        }
        
        node.level = level;
        
        if (prevNode !== null && prevNode.begin === node.begin) {
            // case1
            //이전노드가 존재하고 이전 노드와 현재 노드의 시작값이 같은경우
            //자기를 제외한 나머지 배열부분 잘라서 재귀실행(부모 : 이전 노드 / 나머지 배열 : 자식검출용)
            /* 이전 노드와 수직관계
                <begin="4" end="27" JuziChengfen_tags="prd"/>
                    <begin="4" end="7" JuziChengfen_tags="adv"/> #실제 자식추가는 case3에서 처리
            */
            var tmpArr = arr.slice(i, len);
            if (DEBUG) {
                console.log("   1", $.extend({}, prevNode), $.extend({}, tmpArr));
            }
            prevNode = insertChlid(level + 1, tmpArr, prevNode);
            if (DEBUG) {
                console.log("   1-1", level, $.extend({}, parent), $.extend({}, prevNode));
            }
            if (prevNode === null) {
                return null;
            }
            
            // 기존대로 이전 키값에 넣으면 중복입력 문제가 발생하므로
            // parent.child에 prevNode(insertChild로 넘겼던 부모노드)가 있는지 탐색하고
            var tmpParentChild = parent.child.slice(0);
            var tmpLen = tmpParentChild.length;
            var find = false;
            for (var j = 0; j < tmpLen; j++) {
                if (tmpParentChild[j].id === prevNode.id) {
                    // 있으면 덮어씌우고
                    parent.child[j] = prevNode;
                    find = true;
                    break;
                }
            }
            if (!find) {
                // 없으면 추가함
                parent.child.push(prevNode);
            }

            // 현재 노드가 자식노드였던 경우 insertChlid에서 처리하므로 이전노드(=부모노드)로 현재 노드 재지정
            node = prevNode;
            exceptId += '[' + node.id + ']';
            
        } else if (parent.end === node.end) {
            // case2
            // 부모노드와 현재 노드의 끝이 같은경우 마지막 자식으로 추가하고 반복문 탈출
            /* 이전 노드와 수평관계
                <begin="8" end="12" JuziChengfen_tags="prda"/>
                    ...
                    <begin="10" end="12" JuziChengfen_tags="obj"/>
             */
             if (DEBUG) {
                console.log("   2 마지막 :: ", i, level, parent.id, parent.end, prevNode.id, prevNode.end, node.id, node.end);
                console.log("   2 마지막 :: ", i, level, node.id, node.end);
            }

            // 마지막 노드라서 탈출
            if (node.tag.indexOf('.') > -1) {
                parent.child.push(node);
                exceptId += '[' + node.id + ']';
                break;
            }

        } else if (parent.begin === node.begin) {
            // case4
            // 이전 노드와 수직관계
            // case1에서 넘어왔을 때 부모 노드의 시작점이랑 현재 노드의 시작점이 같으면 부모노드의 자식으로 추가
            if (DEBUG) {
                console.log("   4 자식-자식 :: ", i, level, parent.id + "/" + parent.level, node.id);
            }
            parent.child.push(node);
            exceptId += '[' + node.id + ']';
            
        } else if ((prevNode.end === parent.end) && (parent.end + 1 === node.begin)) {
            // case6
            // 이전노드의 end와 부모의 end가 같은데
            // 현재 노드의 begin이 부모의 다음이면 부모의 부모의 자식으로 추가(level - 2)
            /*
            <custom:JuziChengfen xmi:id="169" sofa="12" begin="11" end="30" JuziChengfen_tags="hed"/> -> target
                <custom:JuziChengfen xmi:id="174" sofa="12" begin="11" end="24" JuziChengfen_tags="prda"/> : parent
                    ...
                    <custom:JuziChengfen xmi:id="189" sofa="12" begin="17" end="24" JuziChengfen_tags="obj"/> : prevNode
                        <custom:JuziChengfen xmi:id="204" sofa="12" begin="17" end="20" JuziChengfen_tags="att."/>
                        <custom:JuziChengfen xmi:id="209" sofa="12" begin="21" end="24" JuziChengfen_tags="hed."/>
                <custom:JuziChengfen xmi:id="179" sofa="12" begin="25" end="30" JuziChengfen_tags="prdb."/> : node
             */
            break;
        } else if (prevNode.end + 1 === node.begin) {
            // case5
            // 이전노드의 끝과 현재노드의 시작이 이어지는지 확인하고 이어지면 형제노드로 추가
            /* 이전 노드와 수평관계
                <begin="8" end="9" JuziChengfen_tags="v"/>
                <begin="10" end="12" JuziChengfen_tags="obj"/>
             */
             if (DEBUG) {
                console.log("   5 자식-형제 :: ", i, level, parent.id, parent.end, node.id, node.end);
                console.log("   5 자식-형제 :: ", prevNode.id + "/" + prevNode.level, node.id);
            }
            parent.child.push(node);
            exceptId += '[' + node.id + ']';
        }

        if (prevNode !== node) {
            prevNode = node;
            prevKey = i;
        }
    }

    console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<", level, "end");
    return parent;
}

function makeTable(tree, dvs) {
    var len = tree.length;
    for (var i = 0; i < len; i++) {
        var tableId = "table" + dvs + "_" + i;
        
        var node = tree[i];
        var child = node.child;
        var childLen = child.length;
        var hasTr = false;
        
        if (child.length > 0) {
            for (var j = 0; j < childLen; j++) {
                var childNode = child[j];
                if (!hasTr && childNode.child.length > 0) {
                    // case1 : 첫 번째 자식노드가 자식을 가진경우(자식의 자식 depth + 2)
                    hasTr = true;
                    childNode.htmlDvs = "tr";
                } else if (hasTr && childNode.child.length > 0) {
                    // case2 : 첫 번째 이후 자식노드가 자식이 있는경우(case1에 덧붙여야됨)
                    childNode.htmlDvs = "td";
                } else {
                    // case3 : 첫 번째 이후 자식노드가 자식이 없는경우
                    childNode.htmlDvs = "leaf";
                    maxSpan++;
                }
                child[j] = childNode;
            }
        }

        var html = "<table id=\"" + tableId + "\" style=\"float:left;\">";
        html += "<tr class=\"1\">";
        html += "<td id=\"" + node.id + "\" colspan=\"" + node.child.length + "\" level=\"" + node.level + "\" onclick=\"toggleTr('" + tableId + "', '" + (node.level + 1) + "');\">";
        html += node.txt;
        html += "</td>";
        html += makeTr(node.level + 1, node.id, 0, tree[i].child, tableId, i);
        html += "</table>";
        $("#body" + dvs).append(html);
    }
    
}

function makeTr(level, parentId, tdCount, tree, tableId, idx) {
    //console.log(level, parentId, tdCount);
    var len = tree.length;
    var html = "<tr class=\"" + level + "\" ";
    if (level !== 1) {
        html += "style=\"display:none;\" ";
    }
    html += ">";
    
    var tmp = "";
    
    /*
    if (idx > 0 && tdCount > 0) {
        html += "<td colspan=\"" + tdCount + "\" style=\"border:none;\"></td>";
    }
    */
    /**/
    if (tdCount > 0) {
        html += "<td type=\"blank\" colspan=\"" + tdCount + "\" style=\"border:none;\"></td>";
    }
    
    var noChild = 0;
    var childTr = "";
    for (var i = 0; i < len; i++) {
        var node = tree[i];
        var htmlDvs = node.htmlDvs;
        var child = node.child;
        
        if (child.length > 0) {
            var childLen = child.length;
            var hasTr = false;
            for (var j = 0; j < childLen; j++) {
                var childNode = child[j];
                if (!hasTr && childNode.child.length > 0) {
                    // case1 : 첫 번째 자식노드가 자식을 가진경우(자식의 자식 depth + 2)
                    hasTr = true;
                    childNode.htmlDvs = "tr";
                } else if (hasTr && childNode.child.length > 0) {
                    // case2 : 첫 번째 이후 자식노드가 자식이 있는경우(case1에 덧붙여야됨)
                    childNode.htmlDvs = "td";
                } else {
                    // case3 : 첫 번째 이후 자식노드가 자식이 없는경우
                    childNode.htmlDvs = "leaf";
                    maxSpan++;
                }
                child[j] = childNode;
            }
        }
        
        var colSpan = getColspan(child);
        html += "<td id=\"" + node.id + "\" colspan=\"" + colSpan + "\" level=\"" + node.level + "\" onclick=\"toggleTr('" + tableId + "', '" + (node.level + 1) + "');\">";
        html += node.txt;
        html += "</td>";

        if (child.length === 0) {
            noChild++;
        }

        if (child.length > 0) {
            if (htmlDvs === "tr") {
                if (noChild !== 0) {
                    tmpTdCount = (level - 1) + noChild;
                    
                    if (tdCount == tmpTdCount) {
                        tmpTdCount++;
                    }
                    
                    tdCount = tmpTdCount;
                }
                tmp += makeTr(node.level + 1, node.id, tdCount, child, tableId, i);

            } else if (htmlDvs === "td") {
                tmp = appendTd(tmp, child, tableId);
            }
        }
    }
    /*
    if (idx === 0 && tdCount > 0) {
        html += "<td colspan=\"" + tdCount + "\" style=\"border:none;\"></td>";
    }
    */
    
    html += "</tr>";
    
    return html + tmp;
}

function appendTd(html, tree, tableId) {
    html = html.substr(0, html.length - 5);
    var len = tree.length;
    var tmp = "";

    if (len === 0) {
        return "<td></td></tr>";
    }

    var noChild = 0;
    for (var i = 0; i < len; i ++) {
        var node = tree[i];
        var htmlDvs = node.htmlDvs;
        var child = node.child;
        
        html += "<td id=\"" + node.id + "\" colspan=\"" + node.child.length + "\" level=\"" + node.level + "\" onclick=\"toggleTr('" + tableId + "', '" + (node.level + 1) + "');\">";
        html += node.txt;
        html += "</td>";
        
        if (child.length === 0) {
            noChild++;
        }
        
        if (child.length > 0) {
            var childLen = child.length;
            var hasTr = false;
            for (var j = 0; j < childLen; j++) {
                var childNode = child[j];
                if (!hasTr && childNode.child.length > 0) {
                    // case1 : 첫 번째 자식노드가 자식을 가진경우(자식의 자식 depth + 2)
                    hasTr = true;
                    childNode.htmlDvs = "tr";
                } else if (hasTr && childNode.child.length > 0) {
                    // case2 : 첫 번째 이후 자식노드가 자식이 있는경우(case1에 덧붙여야됨)
                    childNode.htmlDvs = "td";
                } else {
                    // case3 : 첫 번째 이후 자식노드가 자식이 없는경우
                    childNode.htmlDvs = "leaf";
                    maxSpan++;
                }
                child[j] = childNode;
            }

            if (htmlDvs === "tr") {
                var tdCount = node.level + noChild;
                tmp += makeTr(node.level + 1, node.id, tdCount, child, tableId, i);
            } else if (htmlDvs === "td") {
                tmp = appendTd(tmp, child, tableId);
            }
        }
    }

    return html + "</tr>" + tmp;
}

// leaf 노드 개수 검출
function getColspan(tree) {
    var len = tree.length;
    var ret = 0;
    for (var i = 0; i < len; i++) {
        var node = tree[i];
        var child = node.child;

        if (child.length === 0) {
            ret++;
        }
        
        if (child.length > 0) {
            ret += getColspan(child);
        }
    }

    return ret;
}

function toggleTr(tableId, level) {
    if ($('#' + tableId + " ." + level).css("display") !== "none") {
        $('#' + tableId + " ." + level).hide();
    } else {
        $('#' + tableId + " ." + level).show();
    }
}