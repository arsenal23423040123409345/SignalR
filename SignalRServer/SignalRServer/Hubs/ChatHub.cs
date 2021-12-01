using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Newtonsoft.Json;

namespace SignalRServer.Hubs
{
    public class ChatHub : Hub
    {
        public override Task OnConnectedAsync()
        {
            Console.WriteLine($"Connection established, Id: {Context.ConnectionId}");
            Clients.Client(Context.ConnectionId).SendAsync("ReceiveConnectionId", Context.ConnectionId);

            return base.OnConnectedAsync();
        }

        public async Task SendMessageAsync(string jsonMessage)
        {
            var objectMessage = JsonConvert.DeserializeObject<dynamic>(jsonMessage);

            if (objectMessage != null)
            {
                Console.WriteLine($"Message received on: {Context.ConnectionId}");

                string messageReceiver = objectMessage.To;

                if (!string.IsNullOrEmpty(messageReceiver))
                {
                    Console.WriteLine("Sending directly");

                    await Clients.Client(messageReceiver).SendAsync("ReceiveMessage", jsonMessage);
                }
                else
                {
                    Console.WriteLine("Sending batch");

                    await Clients.All.SendAsync("ReceiveMessage", jsonMessage);
                }
            }
        }
    }
}
