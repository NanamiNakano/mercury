import { Tag, TagGroup } from "@fluentui/react-components";

const TagGroups = (props: { tags: string[] }) => {
  return (
    <TagGroup role="list">
      {props.tags.map((tag) => (
        <Tag key={`tag-${tag}`} role="listitem">
          {tag}
        </Tag>
      ))}
    </TagGroup>
  )
}

export default TagGroups
