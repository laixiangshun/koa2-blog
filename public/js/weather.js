/**
 * Created by lailai on 2017/10/17.
 */
$(function(){
    (function(){
        function updateDate(){
            var now=new Date();
            var day=now.getDay();
            var year=now.getFullYear();
            var month=now.getMonth();
            var date=now.getDate();
            var time=now.toLocaleString();
            var week='';
            switch (day){
                case 0:
                    week='日';
                    break;
                case 1:
                    week='一';
                    break;
                case 2:
                    week='二';
                    break;
                case 3:
                    week='三';
                    break;
                case 4:
                    week='四';
                    break;
                case 5:
                    week='五';
                    break;
                case 6:
                    week='六';
                    break;
            }
            $('.today .day').text(week);
            $('.today .year').text(year);
            $('.today .month').text(month+1);
            $('.today .date').text(date);
            $('.todayotherinfo .time').text('更新时间:'+time);
        }
        //取出字符串中数字的方法
        String.prototype.str2num=function(){
            var reg=/[\d-]/g;
            return parseInt(this.match(reg).join(''));
        };
        //更新所有天气信息
        function update(){
            var city=$('.city').val() || '成都';
            var url='http://wthrcdn.etouch.cn/weather_mini?city='+city;
            $.ajax({
                url: url,
                success: function(info){
                    var tempinfo=JSON.parse(info);
                    if(tempinfo.status==1000){
                        updateDate();
                        $('.today .thiscity').text(city);
                        $('.todayotherinfo .nowtemp').text(tempinfo.data.wendu);
                        $('.todayotherinfo .coldinfo').text(tempinfo.data.ganmao);
                        //更新今日天气信息
                        var today=tempinfo.data.forecast[0];
                        var temprange=today.low.str2num()+"°C~"+today.high.str2num()+'°C';
                        $('.todayinfo .temprange').text(temprange);
                        $('.todayinfo .type').text(today.type);
                        $('.todayinfo .wind').text(today.fengli.str2num()+'级 '+today.fengxiang);
                        $('.todayinfo .aqi').text(tempinfo.data.aqi);

                        $('.show_city').text(city);
                        $('.show_wendu').text(tempinfo.data.wendu+'°C');
                        $('.show_feng').text(today.fengli.str2num()+'级 '+today.fengxiang);
                        $('.show_zhiliang').text(tempinfo.data.aqi);

                        //未来4天天气
                        $('.future li').each(function(index){
                            var idx=index+1;
                            var future=tempinfo.data.forecast[idx];
                            var date=future.date;
                            var temprange=future.low.str2num()+'°C~'+future.high.str2num()+'°C';
                            var type=future.type;
                            var wind=future.fengli.str2num()+'级 '+future.fengxiang;
                            $(this).find('.date').text(date);
                            $(this).find('.temprange').text(temprange);
                            $(this).find('.type').text(type);
                            $(this).find('.wind').text(wind);
                        });
                    }else{
                        $('.today .thiscity').text('无效的城市');
                    }
                }
            });
        }
        update();

        $('.update').click(function (e) {
            update();
        });
        //每小时自动更新
        var updatetimer=setInterval(()=>{
            update();
        },3600000);
    })();
});