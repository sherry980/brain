			var attentionValues; //csv dataset as objects	

			function getData() {
				d3.csv("TestData.csv", function(data) {
					attentionValues = data;
					getGraphData(attentionValues);
					setInterval(updateGauges, 850);
				});
			}