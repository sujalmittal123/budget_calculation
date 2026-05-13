const SkeletonLoader = ({ type = 'card', count = 1 }) => {
  const renderCard = () => (
    <div className="bg-card rounded-xl shadow-sm border border-border p-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="h-4 bg-muted rounded-sm w-1/4 mb-3"></div>
          <div className="h-8 bg-muted rounded-sm w-1/2"></div>
        </div>
        <div className="w-12 h-12 bg-muted rounded-xl"></div>
      </div>
    </div>
  );

  const renderGradientCard = () => (
    <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-muted to-muted animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="h-3 bg-card/30 rounded-sm w-1/3 mb-3"></div>
          <div className="h-10 bg-card/30 rounded-sm w-2/3 mb-2"></div>
          <div className="h-3 bg-card/30 rounded-sm w-1/4"></div>
        </div>
        <div className="w-16 h-16 bg-card/20 rounded-2xl"></div>
      </div>
    </div>
  );

  const renderTable = () => (
    <div className="bg-card rounded-xl shadow-sm border border-border p-6 animate-pulse">
      <div className="space-y-4">
        <div className="h-6 bg-muted rounded-sm w-1/4"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="w-10 h-10 bg-muted rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded-sm w-3/4"></div>
              <div className="h-3 bg-muted rounded-sm w-1/2"></div>
            </div>
            <div className="h-6 bg-muted rounded-sm w-20"></div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderChart = () => (
    <div className="relative rounded-3xl overflow-hidden">
      <div className="absolute inset-0 bg-card/80 backdrop-blur-xl"></div>
      <div className="relative z-10 p-6 animate-pulse">
        <div className="h-6 bg-muted rounded-sm w-1/4 mb-4"></div>
        <div className="h-72 bg-muted rounded-2xl flex items-center justify-center">
          <div className="text-muted-foreground">Loading chart...</div>
        </div>
      </div>
    </div>
  );

  const renderList = () => (
    <div className="space-y-3">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3 rounded-lg bg-background animate-pulse"
        >
          <div className="w-10 h-10 bg-muted rounded-lg"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted rounded-sm w-2/3"></div>
            <div className="h-3 bg-muted rounded-sm w-1/3"></div>
          </div>
          <div className="h-6 bg-muted rounded-sm w-16"></div>
        </div>
      ))}
    </div>
  );

  const renderForm = () => (
    <div className="bg-card rounded-xl shadow-sm border border-border p-6 animate-pulse">
      <div className="space-y-4">
        <div>
          <div className="h-4 bg-muted rounded-sm w-1/4 mb-2"></div>
          <div className="h-10 bg-muted rounded-sm w-full"></div>
        </div>
        <div>
          <div className="h-4 bg-muted rounded-sm w-1/4 mb-2"></div>
          <div className="h-10 bg-muted rounded-sm w-full"></div>
        </div>
        <div className="flex justify-end gap-2">
          <div className="h-10 bg-muted rounded-sm w-24"></div>
          <div className="h-10 bg-muted rounded-sm w-24"></div>
        </div>
      </div>
    </div>
  );

  const components = {
    card: renderCard,
    gradientCard: renderGradientCard,
    table: renderTable,
    chart: renderChart,
    list: renderList,
    form: renderForm,
  };

  const Component = components[type] || renderCard;

  return (
    <>
      {[...Array(count)].map((_, i) => (
        <div key={i}>{Component()}</div>
      ))}
    </>
  );
};

export default SkeletonLoader;
