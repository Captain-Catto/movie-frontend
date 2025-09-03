interface SceneThumbnailsProps {
  scenes: string[];
}

const SceneThumbnails = ({ scenes }: SceneThumbnailsProps) => {
  return (
    <div className="flex space-x-2">
      {scenes.map((scene, index) => (
        <div
          key={index}
          className="w-24 h-16 rounded-lg overflow-hidden cursor-pointer transition-transform hover:scale-105"
        >
          <img
            src={scene}
            alt={`Scene ${index + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
      ))}
    </div>
  );
};

export default SceneThumbnails;